import pytest
from fastapi import BackgroundTasks, HTTPException

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
from app.schemas.process_status import Status
from app.services.process_manager import BuildManager, RunManager

PROCESS_ID = 0
RUN_ID = 42
BUILD_ID = 43


@pytest.mark.parametrize("process_type, process_manager", [("build", BuildManager), ("run", RunManager)])
@pytest.mark.asyncio
async def test_stop_process_success(mocker, process_type, process_manager):
    mock_stop = mocker.AsyncMock()
    mocker.patch.object(process_manager, "stop", mock_stop)

    # Call the function under test
    await _stop_process(PROCESS_ID, process_manager(), process_type)

    # Assert the stop method was called once with the correct id
    mock_stop.assert_awaited_once_with(PROCESS_ID)


# TODO: take into consideration the errors when process type is build
@pytest.mark.parametrize("error_type", [RuntimeError, ProcessLookupError])
@pytest.mark.asyncio
async def test_stop_process_error(mocker, error_type):
    mock_stop = mocker.AsyncMock(side_effect=error_type)
    mocker.patch.object(RunManager, "stop", mock_stop)

    process_type = "run"

    with pytest.raises(HTTPException) as exc_info:
        await _stop_process(PROCESS_ID, RunManager(), process_type)

        # Assert the stop method was called once with the correct id
        assert exc_info.value.status_code == 404
    mock_stop.assert_awaited_once_with(PROCESS_ID)


# TODO: check the errors
@pytest.mark.asyncio
async def test_check_process_status(mocker):
    mocked_process_manager = mocker.MagicMock()
    mocker.patch.object(mocked_process_manager, "processes", {PROCESS_ID: mocker.MagicMock()})
    mocker.patch.object(mocked_process_manager, "get_status", mocker.AsyncMock(return_value=Status.ALIVE))

    response = await _check_process_status(PROCESS_ID, mocked_process_manager)

    assert response == {"status": "alive"}
    mocked_process_manager.get_status.assert_awaited_once_with(0)


@pytest.mark.asyncio
async def test_start_build(mocker):
    build_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock(return_value=BUILD_ID)
    mocker.patch.multiple(build_manager, start=start, check_status=mocker.AsyncMock())
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_build(preset, background_tasks=BackgroundTasks(), build_manager=build_manager)
    start.assert_awaited_once_with(preset)
    assert response == {"status": "ok", "build_id": BUILD_ID}


@pytest.mark.asyncio
async def test_check_build_processes_some_info(mocker, pagination):
    build_manager = mocker.MagicMock(spec=BuildManager())
    run_manager = mocker.MagicMock(spec=RunManager())

    await check_build_processes(BUILD_ID, build_manager, run_manager, pagination)

    build_manager.get_build_info.assert_awaited_once_with(BUILD_ID, run_manager)


@pytest.mark.asyncio
async def test_check_build_processes_all_info(mocker, pagination):
    build_id = None
    build_manager = mocker.MagicMock(spec=BuildManager())
    run_manager = mocker.MagicMock(spec=RunManager())

    await check_build_processes(build_id, build_manager, run_manager, pagination)

    build_manager.get_full_info_with_runs_info.assert_awaited_once_with(
        run_manager, offset=pagination.offset(), limit=pagination.limit
    )


@pytest.mark.asyncio
async def test_get_build_logs(mocker, pagination):
    build_manager = mocker.MagicMock(spec=BuildManager())

    await get_build_logs(BUILD_ID, build_manager, pagination)

    build_manager.fetch_build_logs.assert_awaited_once_with(BUILD_ID, pagination.offset(), pagination.limit)


@pytest.mark.asyncio
async def test_start_run(mocker):
    run_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock(return_value=RUN_ID)
    mocker.patch.multiple(run_manager, start=start, check_status=mocker.AsyncMock())
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_run(
        build_id=BUILD_ID, preset=preset, background_tasks=BackgroundTasks(), run_manager=run_manager
    )
    start.assert_awaited_once_with(BUILD_ID, preset)
    assert response == {"status": "ok", "run_id": RUN_ID}


@pytest.mark.asyncio
async def test_check_run_processes_some_info(mocker, pagination):
    run_manager = mocker.MagicMock(spec=RunManager())

    await check_run_processes(RUN_ID, run_manager, pagination)

    run_manager.get_run_info.assert_awaited_once_with(RUN_ID)


@pytest.mark.asyncio
async def test_check_run_processes_all_info(mocker, pagination):
    run_id = None
    run_manager = mocker.MagicMock(spec=RunManager())

    await check_run_processes(run_id, run_manager, pagination)

    run_manager.get_full_info.assert_awaited_once_with(offset=pagination.offset(), limit=pagination.limit)


@pytest.mark.asyncio
async def test_get_run_logs(mocker, pagination):
    run_manager = mocker.MagicMock(spec=RunManager())

    await get_run_logs(RUN_ID, run_manager, pagination)

    run_manager.fetch_run_logs.assert_awaited_once_with(RUN_ID, pagination.offset(), pagination.limit)


@pytest.mark.asyncio
async def test_connect(mocker):
    websocket = mocker.AsyncMock()
    websocket_manager = mocker.AsyncMock()
    websocket_manager.disconnect = mocker.MagicMock()
    run_manager = mocker.MagicMock()
    run_process = mocker.MagicMock()
    run_manager.processes = {RUN_ID: run_process}
    mocker.patch.object(websocket, "query_params", {"run_id": str(RUN_ID)})

    await connect(websocket, websocket_manager, run_manager)

    websocket_manager.connect.assert_awaited_once_with(websocket)
    websocket_manager.send_process_output_to_websocket.assert_awaited_once_with(RUN_ID, run_manager, websocket)
    websocket_manager.forward_websocket_messages_to_process.assert_awaited_once_with(RUN_ID, run_manager, websocket)
    websocket_manager.disconnect.assert_called_once_with(websocket)
