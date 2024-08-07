import pytest
from fastapi import WebSocket


class TestWebSocketManager:
    @pytest.mark.asyncio
    async def test_connect(self, mocker, websocket_manager):
        mocked_websocket = mocker.MagicMock(spec=WebSocket)

        await websocket_manager.connect(mocked_websocket)

        mocked_websocket.accept.assert_awaited_once_with()
        assert mocked_websocket in websocket_manager.active_connections

    @pytest.mark.asyncio
    async def test_disconnect(self, mocker, websocket_manager):
        mocked_websocket = mocker.MagicMock(spec=WebSocket)
        websocket_manager.active_connections.append(mocked_websocket)
        websocket_manager.pending_tasks[mocked_websocket] = set()

        websocket_manager.disconnect(mocked_websocket)

        assert mocked_websocket not in websocket_manager.pending_tasks
        assert mocked_websocket not in websocket_manager.active_connections

    @pytest.mark.asyncio
    async def test_send_process_output_to_websocket(self, mocker, websocket_manager):
        run_id = 42
        awaited_response = "Hello from DF-Designer"

        websocket = mocker.AsyncMock()
        run_manager = mocker.MagicMock()
        run_process = mocker.MagicMock()
        run_process.read_stdout = mocker.AsyncMock(side_effect=[awaited_response.encode(), None])
        run_manager.processes = {run_id: run_process}

        await websocket_manager.send_process_output_to_websocket(run_id, run_manager, websocket)

        assert run_process.read_stdout.call_count == 2
        websocket.send_text.assert_awaited_once_with(awaited_response)

    @pytest.mark.asyncio
    async def test_forward_websocket_messages_to_process(self, mocker, websocket_manager):
        run_id = 42
        awaited_message = "Hello from DF-Designer"

        websocket = mocker.AsyncMock()
        websocket.receive_text = mocker.AsyncMock(side_effect=[awaited_message, None])
        run_manager = mocker.MagicMock()
        run_process = mocker.MagicMock()
        run_process.write_stdin = mocker.AsyncMock()
        run_manager.processes = {run_id: run_process}

        await websocket_manager.forward_websocket_messages_to_process(run_id, run_manager, websocket)

        assert websocket.receive_text.await_count == 2
        run_process.write_stdin.assert_called_once_with(awaited_message.encode() + b"\n")
