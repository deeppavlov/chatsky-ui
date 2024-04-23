import asyncio
import time
from contextlib import asynccontextmanager

import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from app.api.deps import get_build_manager, get_run_manager
from app.core.logger_config import get_logger
from app.main import app
from app.tests.confest import client  # noqa: F401

logger = get_logger(__name__)


async def _start_process(async_client: AsyncClient, endpoint, preset_end_status) -> httpx.Response:
    return await async_client.post(
        endpoint,
        json={"wait_time": 0.1, "end_status": preset_end_status},
    )


async def _try_communicate(process, message):
    timeout = 5

    try:
        # Attempt to write and read from the process with a timeout.
        await process.write_stdin(message)
        output = await asyncio.wait_for(process.read_stdout(), timeout=timeout)
        logger.debug("Process output afer communication: %s", output)
    except asyncio.exceptions.TimeoutError:
        logger.debug("Process did not accept input within the timeout period.")
        output = None
    return output


@asynccontextmanager
async def _override_dependency(mocker_obj, get_manager_func):
    process_manager = get_manager_func()
    process_manager.check_status = mocker_obj.AsyncMock()
    app.dependency_overrides[get_manager_func] = lambda: process_manager
    try:
        yield process_manager
    finally:
        app.dependency_overrides = {}


async def _assert_process_status(response, process_manager, expected_end_status):
    assert response.json().get("status") == "ok", "Start process response status is not 'ok'"
    process_manager.check_status.assert_awaited_once()

    try:
        await asyncio.wait_for(
            process_manager.processes[process_manager.last_id].process.wait(), timeout=4
        )  # TODO: Consider making this timeout configurable
    except asyncio.exceptions.TimeoutError as exc:
        if expected_end_status == "running":
            logger.debug("Loop process timed out. Expected behavior.")
        else:
            logger.debug("Process with expected end status '%s' timed out with status 'running'.", expected_end_status)
            raise exc

    process_id = process_manager.last_id
    logger.debug("Process id is %s", process_id)
    current_status = process_manager.get_status(process_id)
    assert (
        current_status == expected_end_status
    ), f"Current process status '{current_status}' did not match the expected '{expected_end_status}'"

    return process_id, current_status


async def _assert_interaction_with_running_process(process_manager, process_id, end_status):
    process = process_manager.processes[process_id]
    message = b"Hi\n"

    output = await _try_communicate(process, message)

    if end_status == "success":
        assert output, "No output received from the process"
    elif end_status == "loop":
        assert output is None, "Process replied to an input when it was expected not to."

    process.process.terminate()
    await process.process.wait()


async def _test_start_process(mocker_obj, get_manager_func, endpoint, preset_end_status, expected_end_status):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with _override_dependency(mocker_obj, get_manager_func) as process_manager:
            response = await _start_process(async_client, endpoint, preset_end_status)
            process_id, current_status = await _assert_process_status(response, process_manager, expected_end_status)

            if current_status == "running":
                await _assert_interaction_with_running_process(process_manager, process_id, preset_end_status)


async def _test_stop_process(mocker, get_manager_func, start_endpoint, stop_endpoint):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with _override_dependency(mocker, get_manager_func) as manager:
            start_response = await _start_process(async_client, start_endpoint, preset_end_status="loop")
            assert start_response.status_code == 201
            logger.debug("Processes: %s", manager.processes)

            last_id = manager.get_last_id()
            logger.debug("Last id: %s, type: %s", last_id, type(last_id))
            logger.debug("Process status %s", manager.get_status(last_id))

            stop_response = await async_client.get(f"{stop_endpoint}/{last_id}")
            assert stop_response.status_code == 200
            assert stop_response.json() == {"status": "ok"}


# Test flows endpoints and interaction with db (read and write conf)
def test_flows(client):  # noqa: F811
    get_response = client.get("/api/v1/flows")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert "flows" in data

    response = client.post("/api/v1/flows", json=data)
    assert response.status_code == 200


# def test_get_build_status(client):
#     pass


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "end_status, process_status", [("failure", "failed"), ("loop", "running"), ("success", "completed")]
)
async def test_start_build(mocker, end_status, process_status):
    await _test_start_process(
        mocker,
        get_build_manager,
        endpoint="/api/v1/bot/build/start",
        preset_end_status=end_status,
        expected_end_status=process_status,
    )


@pytest.mark.asyncio
async def test_stop_build(mocker):
    await _test_stop_process(
        mocker, get_build_manager, start_endpoint="/api/v1/bot/build/start", stop_endpoint="/api/v1/bot/build/stop"
    )


# def test_get_run_status(client):
#     pass


# Test processes of various end_status + Test integration with get_status. No db interaction (mocked processes)
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "end_status, process_status", [("failure", "failed"), ("loop", "running"), ("success", "running")]
)
async def test_start_run(mocker, end_status, process_status):
    build_id = 43
    await _test_start_process(
        mocker,
        get_run_manager,
        endpoint=f"/api/v1/bot/run/start/{build_id}",
        preset_end_status=end_status,
        expected_end_status=process_status,
    )


@pytest.mark.asyncio
async def test_stop_run(mocker):
    build_id = 43
    await _test_stop_process(
        mocker,
        get_run_manager,
        start_endpoint=f"/api/v1/bot/run/start/{build_id}",
        stop_endpoint="/api/v1/bot/run/stop",
    )


@pytest.mark.asyncio
async def test_connect_to_ws(mocker, client):  # noqa: F811
    build_id = 43

    # Start a process
    run_manager = get_run_manager()
    run_manager.check_status = mocker.AsyncMock()
    app.dependency_overrides[get_run_manager] = lambda: run_manager

    start_response = client.post(
        f"/api/v1/bot/run/start/{build_id}",
        json={"wait_time": 0.1, "end_status": "success"},
    )

    assert start_response.status_code == 201
    logger.debug("Processes: %s", run_manager.processes)

    # Process status
    last_id = run_manager.get_last_id()
    logger.debug("Last id: %s, type: %s", last_id, type(last_id))
    logger.debug(
        "Process status %s",
        run_manager.get_status(last_id),
    )

    # connect to websocket
    with client.websocket_connect(f"/api/v1/bot/run/connect?run_id={last_id}") as websocket:
        data = websocket.receive_text()
        assert data == "Start chatting"

        # Check sending and receiving messages
        websocket.send_text("Hi")
        data = websocket.receive_text()
        assert data
        logger.debug("Received data: %s", data)
