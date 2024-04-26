import pytest
from fastapi import BackgroundTasks, HTTPException, WebSocket

from app.api.api_v1.endpoints.bot import (
    _check_process_status,
    _stop_process,
    check_build_processes,
    check_run_processes,
    connect,
    get_build_logs,
    get_run_logs,
    start_build,
    start_run,
)
from app.schemas.pagination import Pagination
from app.services.process import RunProcess
from app.services.process_manager import BuildManager, RunManager
from app.services.websocket_manager import WebSocketManager


@pytest.mark.parametrize("process_type, process_manager", [("build", BuildManager), ("run", RunManager)])
@pytest.mark.asyncio
async def test_stop_process_success(mocker, process_type, process_manager):
    mock_stop = mocker.AsyncMock()
    mocker.patch.object(process_manager, "stop", mock_stop)

    id_to_test = 0

    # Call the function under test
    await _stop_process(id_to_test, process_manager(), process_type)

    # Assert the stop method was called once with the correct id
    mock_stop.assert_awaited_once_with(id_to_test)


# TODO: take into consideration the errors when process type is build
@pytest.mark.parametrize("error_type", [RuntimeError, ProcessLookupError])
@pytest.mark.asyncio
async def test_stop_process_error(mocker, error_type):
    mock_stop = mocker.AsyncMock(side_effect=error_type)
    mocker.patch.object(RunManager, "stop", mock_stop)

    id_to_test = 0
    process_type = "run"

    with pytest.raises(HTTPException) as exc_info:
        await _stop_process(id_to_test, RunManager(), process_type)

        # Assert the stop method was called once with the correct id
        assert exc_info.value.status_code == 404
    mock_stop.assert_awaited_once_with(id_to_test)


# TODO: check the errors
@pytest.mark.asyncio
async def test_check_process_status(mocker):
    process_id = 0
    mocked_process_manager = mocker.MagicMock()
    mocker.patch.object(mocked_process_manager, "processes", {process_id: mocker.MagicMock()})
    mocker.patch.object(mocked_process_manager, "get_status", mocker.AsyncMock(return_value="alive"))

    response = await _check_process_status(process_id, mocked_process_manager)

    assert response == {"status": "alive"}
    mocked_process_manager.get_status.assert_awaited_once_with(0)


@pytest.mark.asyncio
async def test_start_build(mocker):
    build_id = 0
    build_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock()
    mocker.patch.multiple(
        build_manager, start=start, get_last_id=mocker.MagicMock(return_value=build_id), check_status=mocker.AsyncMock()
    )
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_build(preset, background_tasks=BackgroundTasks(), build_manager=build_manager)
    start.assert_awaited_once_with(preset)
    assert response == {"status": "ok", "build_id": build_id}


@pytest.mark.asyncio
async def test_check_build_processes_some_info(mocker):
    build_id = 42
    build_manager = mocker.MagicMock(spec=BuildManager())
    pagination = Pagination()

    await check_build_processes(build_id, build_manager, pagination)

    build_manager.get_build_info.assert_awaited_once_with(build_id)


@pytest.mark.asyncio
async def test_check_build_processes_all_info(mocker):
    build_id = None
    build_manager = mocker.MagicMock(spec=BuildManager())
    pagination = Pagination()

    await check_build_processes(build_id, build_manager, pagination)

    build_manager.get_full_info.assert_awaited_once_with(offset=pagination.offset(), limit=pagination.limit)


@pytest.mark.asyncio
async def test_get_build_logs(mocker):
    build_id = 42
    build_manager = mocker.MagicMock(spec=BuildManager())
    pagination = mocker.MagicMock()

    await get_build_logs(build_id, build_manager, pagination)

    build_manager.fetch_build_logs.assert_awaited_once_with(build_id, pagination.offset(), pagination.limit)


@pytest.mark.asyncio
async def test_start_run(mocker):
    build_id = 0
    run_id = 0
    run_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock()
    mocker.patch.multiple(
        run_manager, start=start, get_last_id=mocker.MagicMock(return_value=run_id), check_status=mocker.AsyncMock()
    )
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_run(
        build_id=build_id, preset=preset, background_tasks=BackgroundTasks(), run_manager=run_manager
    )
    start.assert_awaited_once_with(build_id, preset)
    assert response == {"status": "ok", "run_id": run_id}


@pytest.mark.asyncio
async def test_check_run_processes_some_info(mocker):
    run_id = 42
    run_manager = mocker.MagicMock(spec=RunManager())
    pagination = Pagination()  # TODO: replace with fixture

    await check_run_processes(run_id, run_manager, pagination)

    run_manager.get_run_info.assert_awaited_once_with(run_id)


@pytest.mark.asyncio
async def test_check_run_processes_all_info(mocker):
    run_id = None
    run_manager = mocker.MagicMock(spec=RunManager())
    pagination = Pagination()

    await check_run_processes(run_id, run_manager, pagination)

    run_manager.get_full_info.assert_awaited_once_with(offset=pagination.offset(), limit=pagination.limit)


@pytest.mark.asyncio
async def test_get_run_logs(mocker):
    run_id = 42
    run_manager = mocker.MagicMock(spec=RunManager())
    pagination = Pagination()

    await get_run_logs(run_id, run_manager, pagination)

    run_manager.fetch_run_logs.assert_awaited_once_with(run_id, pagination.offset(), pagination.limit)


@pytest.mark.asyncio
async def test_connect(mocker):
    run_id = 42
    websocket = mocker.MagicMock(spec=WebSocket)
    websocket_manager = mocker.MagicMock(spec=WebSocketManager())
    run_manager = mocker.MagicMock(spec=RunManager())
    run_process = mocker.MagicMock(spec=RunProcess(run_id))
    run_manager.processes = {run_id: run_process}
    mocker.patch.object(websocket, "query_params", {"run_id": str(run_id)})

    await connect(websocket, websocket_manager, run_manager)

    websocket_manager.connect.assert_awaited_once_with(websocket)
    websocket_manager.send_process_output_to_websocket.assert_awaited_once_with(run_id, run_manager, websocket)
    websocket_manager.forward_websocket_messages_to_process.assert_awaited_once_with(run_id, run_manager, websocket)
    websocket_manager.disconnect.assert_called_once_with(websocket)
