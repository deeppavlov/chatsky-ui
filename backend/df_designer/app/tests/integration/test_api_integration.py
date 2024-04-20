import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import status

from app.tests.confest import client
from app.services.process_manager import RunManager
from app.api.deps import get_run_manager, get_build_manager
from app.main import app
from app.core.logger_config import get_logger

logger = get_logger(__name__)

async def _test_start_process(mocker_obj, get_manager_func, endpoint: str, end_status: str, process_status: str):
    process_manager = get_manager_func()
    process_manager.check_status = mocker_obj.AsyncMock()
    app.dependency_overrides[get_manager_func] = lambda: process_manager

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        response = await async_client.post(
            endpoint,
            json={"wait_time": 0.1, "end_status": end_status},
        )

    assert "status" in response.json() and response.json()["status"] == "ok"
    assert process_manager.check_status.await_count == 1
    await asyncio.sleep(4)
    logger.debug("Processs id is %s", process_manager.last_id)
    assert process_manager.get_status(process_manager.last_id) == process_status

    # Close the process and delete the dependency override
    if process_manager.get_status(process_manager.last_id) == "running":
        process = process_manager.processes[process_manager.last_id].process
        process.terminate()
        await process.wait()
    app.dependency_overrides = {}

    return process_manager



async def _test_stop_process(mocker_obj, get_manager_func):
    # Setup code to ensure a process is up and running then stop it

    # Mock the check_status function to avoid getting in indefinite loop
    process_manager = get_manager_func()
    process_manager.check_status = mocker.AsyncMock()
    app.dependency_overrides[get_build_manager] = lambda: process_manager

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        # Start a process
        start_response = await async_client.post(
            "/api/v1/bot/build/start",
            json={"wait_time": 0.1, "end_status": "loop"},
        )
        assert start_response.status_code == 201
        logger.debug("Processes: %s", process_manager.processes)

        # Process status
        last_id = process_manager.get_last_id()
        logger.debug("Last id: %s, type: %s", last_id, type(last_id))
        logger.debug("Process status %s", process_manager.get_status(last_id),)

        # Stop the process
        stop_response = await async_client.get(f"/api/v1/bot/build/stop/{last_id}")
        assert stop_response.status_code == 200
        assert stop_response.json() == {"status": "ok"}



# test flows endpoint -> db base (read and write conf)
def test_flows(client):
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
        end_status=end_status,
        process_status=process_status
    )


@pytest.mark.asyncio
async def test_stop_build(mocker):
    # Setup code to ensure a process is up and running then stop it

    # Mock the check_status function to avoid getting in indefinite loop
    build_manager = get_build_manager()
    build_manager.check_status = mocker.AsyncMock()
    app.dependency_overrides[get_build_manager] = lambda: build_manager

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        # Start a process
        start_response = await async_client.post(
            "/api/v1/bot/build/start",
            json={"wait_time": 0.1, "end_status": "loop"},
        )
        assert start_response.status_code == 201
        logger.debug("Processes: %s", build_manager.processes)

        # Process status
        last_id = build_manager.get_last_id()
        logger.debug("Last id: %s, type: %s", last_id, type(last_id))
        logger.debug("Process status %s", build_manager.get_status(last_id),)

        # Stop the process
        stop_response = await async_client.get(f"/api/v1/bot/build/stop/{last_id}")
        assert stop_response.status_code == 200
        assert stop_response.json() == {"status": "ok"}


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
        end_status=end_status,
        process_status=process_status
    )


@pytest.mark.asyncio
async def test_stop_run(mocker):
    build_id = 43
    # Setup code to ensure a process is up and running then stop it

    # Mock the check_status function to avoid getting in indefinite loop
    run_manager = get_run_manager()
    run_manager.check_status = mocker.AsyncMock()
    app.dependency_overrides[get_run_manager] = lambda: run_manager

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        # Start a process
        start_response = await async_client.post(
            f"/api/v1/bot/run/start/{build_id}",
            json={"wait_time": 0.1, "end_status": "loop"},
        )
        assert start_response.status_code == 201
        logger.debug("Processes: %s", run_manager.processes)

        # Process status
        last_id = run_manager.get_last_id()
        logger.debug("Last id: %s, type: %s", last_id, type(last_id))
        logger.debug("Process status %s", run_manager.get_status(last_id),)

        # Stop the process
        stop_response = await async_client.get(f"/api/v1/bot/run/stop/{last_id}")
        assert stop_response.status_code == 200
        assert stop_response.json() == {"status": "ok"}


