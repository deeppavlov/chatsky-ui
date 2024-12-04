import asyncio
import os

import pytest
from dotenv import load_dotenv
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

from chatsky_ui.api.deps import get_build_manager, get_run_manager
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.main import app
from chatsky_ui.schemas.process_status import Status

load_dotenv()

BUILD_COMPLETION_TIMEOUT = float(os.getenv("BUILD_COMPLETION_TIMEOUT", 10))
RUN_RUNNING_TIMEOUT = float(os.getenv("RUN_RUNNING_TIMEOUT", 5))

logger = get_logger(__name__)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "preset_status, expected_status",
    [("failure", Status.FAILED), ("loop", Status.RUNNING), ("success", Status.COMPLETED)],
)
async def test_start_build(mocker, override_dependency, preset_status, expected_status):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_build_manager) as process_manager:
            process_manager.save_built_script_to_git = mocker.MagicMock()
            process_manager.is_changed_graph = mocker.MagicMock(return_value=True)

            response = await async_client.post(
                "/api/v1/bot/build/start",
                json={"wait_time": 0.1, "end_status": preset_status},
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
@pytest.mark.parametrize(
    "preset_status, expected_status", [("failure", Status.FAILED), ("loop", Status.RUNNING), ("success", Status.ALIVE)]
)
async def test_start_run(override_dependency, preset_status, expected_status, dummy_build_id):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        async with override_dependency(get_run_manager) as process_manager:
            response = await async_client.post(
                f"/api/v1/bot/run/start/{dummy_build_id}",
                json={"wait_time": 0.1, "end_status": preset_status},
            )

            assert response.json().get("status") == "ok", "Start process response status is not 'ok'"

            process_id = process_manager.last_id
            process = process_manager.processes[process_id]

            try:
                await asyncio.wait_for(process.process.wait(), timeout=RUN_RUNNING_TIMEOUT)
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
