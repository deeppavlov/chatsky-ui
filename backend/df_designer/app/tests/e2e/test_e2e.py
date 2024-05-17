import asyncio

import httpx
import pytest
from httpx_ws import aconnect_ws
from httpx_ws.transport import ASGIWebSocketTransport

from app.api.deps import get_build_manager, get_run_manager
from app.core.logger_config import get_logger
from app.main import app
from app.schemas.process_status import Status
from app.tests.conftest import override_dependency, start_process

logger = get_logger(__name__)


async def _assert_process_status(response, process_manager):
    assert response.json().get("status") == "ok", "Start process response status is not 'ok'"
    process_manager.check_status.assert_awaited_once()


@pytest.mark.asyncio
async def test_all(mocker):
    async with httpx.AsyncClient(transport=ASGIWebSocketTransport(app)) as client:
        async with override_dependency(mocker, get_build_manager) as process_manager:
            response = await start_process(
                client,
                endpoint="http://localhost:8000/api/v1/bot/build/start",
                preset_end_status="success",
            )

            build_id = process_manager.get_last_id()

            await _assert_process_status(response, process_manager)
            try:
                await asyncio.wait_for(process_manager.processes[build_id].process.wait(), timeout=20)
            except asyncio.exceptions.TimeoutError as exc:
                raise Exception(
                    "Process with expected end status Status.ALIVE timed out with status Status.RUNNING."
                ) from exc
            assert await process_manager.get_status(build_id) == Status.COMPLETED

        async with override_dependency(mocker, get_run_manager) as process_manager:
            response = await start_process(
                client,
                endpoint=f"http://localhost:8000/api/v1/bot/run/start/{build_id}",
                preset_end_status="success",
            )

            run_id = process_manager.get_last_id()

            await _assert_process_status(response, process_manager)
            await asyncio.sleep(10)
            assert await process_manager.get_status(run_id) == Status.ALIVE

            async with aconnect_ws(f"http://localhost:8000/api/v1/bot/run/connect?run_id={run_id}", client) as ws:
                message = await ws.receive_text()
                assert message == "Start chatting"
