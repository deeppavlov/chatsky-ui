import asyncio
import os

import pytest
from dotenv import load_dotenv
from fastapi import status
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

from chatsky_ui.api.deps import get_build_manager, get_run_manager
from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.main import app
from chatsky_ui.schemas.process_status import Status

load_dotenv()

BUILD_COMPLETION_TIMEOUT = float(os.getenv("BUILD_COMPLETION_TIMEOUT", 15))
RUN_RUNNING_TIMEOUT = float(os.getenv("RUN_RUNNING_TIMEOUT", 5))
DELAY_BETWEEN_BUILDS = float(os.getenv("DELAY_BETWEEN_BUILDS", 5))
DELAY_BETWEEN_RUNS = float(os.getenv("DELAY_BETWEEN_RUNS", 13))


async def _start_process_with_retry(client, endpoint, data, delay, retries=1):
    response = await client.post(endpoint, json=data)
    if response.status_code == 400 and retries > 0:
        await asyncio.sleep(delay)
        return await _start_process_with_retry(client, endpoint, data, retries - 1, delay)
    return response


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "preset_status, expected_status",
    [("failure", Status.FAILED), ("loop", Status.RUNNING), ("success", Status.COMPLETED)],
)
async def test_start_build(
    mocker, override_dependency, preset_status, expected_status, start_build_endpoint, dummy_build_preset
):
    logger = get_logger(__name__)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_build_manager) as process_manager:
            process_manager.save_built_script_to_git = mocker.MagicMock()
            process_manager.is_changed_graph = mocker.MagicMock(return_value=True)

            response = await _start_process_with_retry(
                async_client, start_build_endpoint, dummy_build_preset(preset_status).model_dump(), DELAY_BETWEEN_BUILDS
            )

            assert response.json().get("status") == "ok", "Start process response status is not 'ok'"

            process_id = process_manager.last_id
            process = process_manager.processes[process_id]

            try:
                await asyncio.wait_for(process.process.wait(), timeout=BUILD_COMPLETION_TIMEOUT)
            except asyncio.exceptions.TimeoutError as exc:
                if preset_status == "loop":
                    logger.debug("Loop process timed out. Expected behavior.")
                    assert True
                    await process.stop()
                    return
                else:
                    raise Exception(
                        f"Process with expected end status '{preset_status}' timed out with "
                        f"return code '{process.process.returncode}'."
                    ) from exc

            current_status = await process_manager.get_status(process_id)
            assert (
                current_status == expected_status
            ), f"Current process status '{current_status}' did not match the expected '{expected_status}'"


@pytest.mark.asyncio
async def test_stop_build(override_dependency, start_build_endpoint, stop_build_endpoint, dummy_build_preset):
    logger = get_logger(__name__)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_build_manager) as manager:
            response = await _start_process_with_retry(
                async_client, start_build_endpoint, dummy_build_preset().model_dump(), DELAY_BETWEEN_BUILDS
            )

            assert response.status_code == 201
            logger.debug("Processes: %s", manager.processes)

            last_id = manager.get_last_id()
            logger.debug("Last id: %s, type: %s", last_id, type(last_id))
            logger.debug("Process status %s", await manager.get_status(last_id))

            stop_response = await async_client.get(stop_build_endpoint(str(last_id)))
            assert stop_response.status_code == 200
            assert stop_response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_stop_build_bad_id(
    override_dependency, start_build_endpoint, stop_build_endpoint, inexistent_id, dummy_build_preset
):
    logger = get_logger(__name__)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_build_manager) as manager:
            response = await _start_process_with_retry(
                async_client, start_build_endpoint, dummy_build_preset().model_dump(), DELAY_BETWEEN_BUILDS
            )

            assert response.status_code == 201
            logger.debug("Processes: %s", manager.processes)

            stop_response = await async_client.get(stop_build_endpoint(inexistent_id))
            assert stop_response.status_code == status.HTTP_404_NOT_FOUND
            assert stop_response.json() == {
                "detail": "Process not found. It may have already exited or not started yet. Please check logs."
            }


@pytest.mark.asyncio
@pytest.mark.parametrize("preset_status", ["failure", "loop", "success"])
async def test_start_run(
    mocker, override_dependency, preset_status, start_run_endpoint, dummy_build_id, dummy_run_preset
):
    logger = get_logger(__name__)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_run_manager) as process_manager:

            settings.add_env_vars({"TG_MY_TOKEN": "7581183652:AAG3k40MhM7cqwh1KQg_66nklnkB5taRGyk"})

            response = await _start_process_with_retry(
                async_client,
                start_run_endpoint(dummy_build_id),
                dummy_run_preset(preset_status).model_dump(),
                DELAY_BETWEEN_RUNS,
            )

            assert response.json().get("status") == "ok", "Start process response status is not 'ok'"

            process_id = process_manager.last_id
            process = process_manager.processes[process_id]

            try:
                await asyncio.wait_for(process.process.wait(), timeout=RUN_RUNNING_TIMEOUT)
            except asyncio.exceptions.TimeoutError as exc:
                if preset_status == "success":
                    logger.debug("Success run process timed out. Expected behavior.")

                    mocker.patch("chatsky_ui.services.process.PING_PONG_TIMEOUT", 15)
                    assert await process_manager.processes[
                        process_id
                    ].is_alive(), "Current process status 'Running' did not match the expected 'Alive'"
                    try:
                        await process.stop()
                    except ProcessLookupError:
                        logger.debug("Process already stopped.")
                elif preset_status == "loop":
                    logger.debug("Loop process timed out. Expected behavior.")
                    assert True
                    await process.stop()
                else:
                    raise Exception(
                        f"Process with expected end status '{preset_status}' timed out with "
                        f"return code '{process.process.returncode}'."
                    ) from exc


# @pytest.mark.asyncio
# async def test_get_run_logs(override_dependency, start_run_endpoint, dummy_build_id, dummy_run_preset):
#     async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
#         async with override_dependency(get_run_manager) as process_manager:
#             settings.add_env_vars({"TG_MY_TOKEN": "7581183652:AAG3k40MhM7cqwh1KQg_66nklnkB5taRGyk"})
#             response = await _start_process_with_retry(
#                 async_client, start_run_endpoint(dummy_build_id), dummy_run_preset().model_dump(), DELAY_BETWEEN_RUNS
#             )

#             run_id = process_manager.last_id


#             assert response.json().get("status") == "ok", "Start process response status is not 'ok'"

#             get_response = await async_client.get(f"/api/v1/bot/runs/logs/{run_id}")

#             assert get_response.status_code == 200
#             assert get_response.json()
