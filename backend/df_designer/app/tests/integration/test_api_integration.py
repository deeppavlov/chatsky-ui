import asyncio
import os

import httpx
import pytest
from dotenv import load_dotenv
from fastapi import status
from httpx import ASGITransport, AsyncClient
from httpx_ws import aconnect_ws
from httpx_ws.transport import ASGIWebSocketTransport

from app.api.deps import get_build_manager, get_run_manager
from app.core.logger_config import get_logger
from app.main import app
from app.schemas.process_status import Status
from app.tests.conftest import override_dependency, start_process

load_dotenv()

BUILD_COMPLETION_TIMEOUT = float(os.getenv("BUILD_COMPLETION_TIMEOUT", 10))
RUN_RUNNING_TIMEOUT = float(os.getenv("RUN_RUNNING_TIMEOUT", 5))

logger = get_logger(__name__)


async def _assert_process_status(response, process_manager, expected_end_status, timeout):
    assert response.json().get("status") == "ok", "Start process response status is not 'ok'"
    process_manager.check_status.assert_awaited_once()

    try:
        await asyncio.wait_for(process_manager.processes[process_manager.last_id].process.wait(), timeout=timeout)
    except asyncio.exceptions.TimeoutError as exc:
        if expected_end_status in [Status.ALIVE, Status.RUNNING]:
            logger.debug("Loop process timed out. Expected behavior.")
        else:
            raise Exception(
                f"Process with expected end status '{expected_end_status}' timed out with status 'running'."
            ) from exc

    process_id = process_manager.last_id
    logger.debug("Process id is %s", process_id)
    current_status = await process_manager.get_status(process_id)
    assert (
        current_status == expected_end_status
    ), f"Current process status '{current_status}' did not match the expected '{expected_end_status}'"

    return current_status


async def _test_start_process(mocker_obj, get_manager_func, endpoint, preset_end_status, expected_end_status, timeout):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(mocker_obj, get_manager_func) as process_manager:
            response = await start_process(async_client, endpoint, preset_end_status)
            current_status = await _assert_process_status(response, process_manager, expected_end_status, timeout)

            if current_status == Status.RUNNING:
                process_manager.processes[process_manager.last_id].process.terminate()
                await process_manager.processes[process_manager.last_id].process.wait()


async def _test_stop_process(mocker, get_manager_func, start_endpoint, stop_endpoint):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(mocker, get_manager_func) as manager:
            start_response = await start_process(async_client, start_endpoint, preset_end_status="loop")
            assert start_response.status_code == 201
            logger.debug("Processes: %s", manager.processes)

            last_id = manager.get_last_id()
            logger.debug("Last id: %s, type: %s", last_id, type(last_id))
            logger.debug("Process status %s", await manager.get_status(last_id))

            stop_response = await async_client.get(f"{stop_endpoint}/{last_id}")
            assert stop_response.status_code == 200
            assert stop_response.json() == {"status": "ok"}


async def _test_stop_inexistent_process(mocker, get_manager_func, start_endpoint, stop_endpoint):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(mocker, get_manager_func) as manager:
            start_response = await start_process(async_client, start_endpoint, preset_end_status="loop")
            assert start_response.status_code == 201
            logger.debug("Processes: %s", manager.processes)

            inexistent_id = 9999

            stop_response = await async_client.get(f"{stop_endpoint}/{inexistent_id}")
            assert stop_response.status_code == status.HTTP_404_NOT_FOUND
            assert stop_response.json() == {
                "detail": "Process not found. It may have already exited or not started yet. Please check logs."
            }


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
    "end_status, process_status", [("failure", Status.FAILED), ("loop", Status.RUNNING), ("success", Status.COMPLETED)]
)
async def test_start_build(mocker, end_status, process_status):
    await _test_start_process(
        mocker,
        get_build_manager,
        endpoint="/api/v1/bot/build/start",
        preset_end_status=end_status,
        expected_end_status=process_status,
        timeout=BUILD_COMPLETION_TIMEOUT,
    )


@pytest.mark.asyncio
async def test_stop_build(mocker):
    await _test_stop_process(
        mocker, get_build_manager, start_endpoint="/api/v1/bot/build/start", stop_endpoint="/api/v1/bot/build/stop"
    )


@pytest.mark.asyncio
async def test_stop_build_bad_id(mocker):
    await _test_stop_inexistent_process(
        mocker, get_build_manager, start_endpoint="/api/v1/bot/build/start", stop_endpoint="/api/v1/bot/build/stop"
    )


# def test_get_run_status(client):
#     pass


# Test processes of various end_status + Test integration with get_status. No db interaction (mocked processes)
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "end_status, process_status", [("failure", Status.FAILED), ("loop", Status.RUNNING), ("success", Status.ALIVE)]
)
async def test_start_run(mocker, end_status, process_status):
    build_id = 43
    await _test_start_process(
        mocker,
        get_run_manager,
        endpoint=f"/api/v1/bot/run/start/{build_id}",
        preset_end_status=end_status,
        expected_end_status=process_status,
        timeout=RUN_RUNNING_TIMEOUT,
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
async def test_stop_run_bad_id(mocker):
    build_id = 43
    await _test_stop_inexistent_process(
        mocker,
        get_run_manager,
        start_endpoint=f"/api/v1/bot/run/start/{build_id}",
        stop_endpoint="/api/v1/bot/run/stop",
    )


@pytest.mark.asyncio
async def test_connect_to_ws(mocker):
    build_id = 43

    async with httpx.AsyncClient(transport=ASGIWebSocketTransport(app)) as client:
        async with override_dependency(mocker, get_run_manager) as process_manager:
            # Start a process
            start_response = await start_process(
                client,
                endpoint=f"http://localhost:8000/api/v1/bot/run/start/{build_id}",
                preset_end_status="success",
            )
            assert start_response.status_code == 201
            process_manager.check_status.assert_awaited_once()

            run_id = process_manager.get_last_id()
            logger.debug(f"run_id: {run_id}")
            await asyncio.sleep(10)

            assert await process_manager.get_status(run_id) == Status.ALIVE

            async with aconnect_ws(f"http://localhost:8000/api/v1/bot/run/connect?run_id={run_id}", client) as ws:
                message = await ws.receive_text()
                assert message == "Start chatting"


def test_search_service(client):
    get_response = client.get("/api/v1/services/search/is_upper_case")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert data


def test_get_conditions(client):
    get_response = client.get("/api/v1/services/get_conditions")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert data
