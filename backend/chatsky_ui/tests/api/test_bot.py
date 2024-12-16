import pytest
from fastapi import BackgroundTasks, HTTPException

from chatsky_ui.api.api_v1.endpoints.bot import (
    _check_process_status,
    _stop_process,
    check_build_processes,
    check_run_processes,
    get_build_logs,
    get_run_logs,
    start_build,
    start_run,
)
from chatsky_ui.schemas.process_status import Status
from chatsky_ui.services.process_manager import RunManager

PROCESS_ID = 0


@pytest.mark.asyncio
async def test_stop_process_success(mocker):
    process_manager = mocker.MagicMock()
    process_manager.stop = mocker.AsyncMock()

    # Call the function under test
    await _stop_process(PROCESS_ID, process_manager)

    # Assert the stop method was called once with the correct id
    process_manager.stop.assert_awaited_once_with(PROCESS_ID)


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
async def test_start_build(mocker, dummy_build_id):
    build_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock(return_value=dummy_build_id)
    mocker.patch.multiple(build_manager, start=start, check_status=mocker.AsyncMock())
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_build(preset, background_tasks=BackgroundTasks(), build_manager=build_manager)
    start.assert_awaited_once_with(preset)
    assert response == {"status": "ok", "build_id": dummy_build_id}


@pytest.mark.asyncio
async def test_check_build_processes_some_info(mocker, pagination, dummy_build_id):
    build_manager = mocker.AsyncMock()
    run_manager = mocker.AsyncMock()

    await check_build_processes(dummy_build_id, build_manager, run_manager, pagination)

    build_manager.get_build_info.assert_awaited_once_with(dummy_build_id, run_manager)


@pytest.mark.asyncio
async def test_check_build_processes_all_info(mocker, pagination):
    build_id = None
    build_manager = mocker.AsyncMock()
    run_manager = mocker.AsyncMock()

    await check_build_processes(build_id, build_manager, run_manager, pagination)

    build_manager.get_full_info_with_runs_info.assert_awaited_once_with(
        run_manager, offset=pagination.offset(), limit=pagination.limit
    )


@pytest.mark.asyncio
async def test_get_build_logs(mocker, pagination, dummy_build_id):
    build_manager = mocker.AsyncMock()

    await get_build_logs(dummy_build_id, build_manager, pagination)

    build_manager.fetch_build_logs.assert_awaited_once_with(dummy_build_id, pagination.offset(), pagination.limit)


@pytest.mark.asyncio
async def test_start_run(mocker, dummy_build_id, dummy_run_id):
    run_manager = mocker.MagicMock()
    preset = mocker.MagicMock()

    start = mocker.AsyncMock(return_value=dummy_run_id)
    mocker.patch.multiple(run_manager, start=start, check_status=mocker.AsyncMock())
    mocker.patch.multiple(preset, wait_time=0, end_status="loop")

    response = await start_run(
        build_id=dummy_build_id, preset=preset, background_tasks=BackgroundTasks(), run_manager=run_manager
    )
    start.assert_awaited_once_with(dummy_build_id, preset)
    assert response == {"status": "ok", "run_id": dummy_run_id}


@pytest.mark.asyncio
async def test_check_run_processes_some_info(mocker, pagination, dummy_run_id):
    run_manager = mocker.AsyncMock()

    await check_run_processes(dummy_run_id, run_manager, pagination)

    run_manager.get_run_info.assert_awaited_once_with(dummy_run_id)


@pytest.mark.asyncio
async def test_check_run_processes_all_info(mocker, pagination):
    run_id = None
    run_manager = mocker.AsyncMock()

    await check_run_processes(run_id, run_manager, pagination)

    run_manager.get_full_info.assert_awaited_once_with(offset=pagination.offset(), limit=pagination.limit)


@pytest.mark.asyncio
async def test_get_run_logs(mocker, pagination, dummy_run_id):
    run_manager = mocker.AsyncMock()

    await get_run_logs(dummy_run_id, run_manager, pagination)

    run_manager.fetch_run_logs.assert_awaited_once_with(dummy_run_id, pagination.offset(), pagination.limit)
