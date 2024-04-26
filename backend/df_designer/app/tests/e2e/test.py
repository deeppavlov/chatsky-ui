import pytest

from app.api.deps import get_build_manager, get_run_manager
from app.core.logger_config import get_logger
from app.tests.conftest import override_dependency, start_process

BUILD_ID = 43

logger = get_logger(__name__)


async def _assert_process_status(response, process_manager):
    assert response.json().get("status") == "ok", "Start process response status is not 'ok'"
    process_manager.check_status.assert_awaited_once()


@pytest.mark.asyncio
async def test_all(mocker, client):
    async with override_dependency(mocker, get_build_manager) as process_manager:
        response = start_process(client, endpoint="/api/v1/bot/build/start", preset_end_status="success")
        await _assert_process_status(response, process_manager)

    async with override_dependency(mocker, get_run_manager) as process_manager:
        response = start_process(client, endpoint=f"/api/v1/bot/run/start/{BUILD_ID}", preset_end_status="success")
        await _assert_process_status(response, process_manager)

        # connect to websocket
        with client.websocket_connect(f"/api/v1/bot/run/connect?run_id={process_manager.get_last_id()}") as websocket:
            data = websocket.receive_text()
            assert data == "Start chatting"

            # Check sending and receiving messages
            websocket.send_text("Hi")
            data = websocket.receive_text()
            assert data
            logger.debug("Received data: %s", data)
