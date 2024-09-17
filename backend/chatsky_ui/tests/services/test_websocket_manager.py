import pytest
from fastapi import WebSocket


RUN_ID = 42


class TestWebSocketManager:
    @pytest.mark.asyncio
    async def test_connect(self, mocker, websocket_manager):
        mocked_websocket = mocker.MagicMock()
        mocked_websocket.accept = mocker.AsyncMock()

        await websocket_manager.connect(RUN_ID, mocked_websocket)

        mocked_websocket.accept.assert_awaited_once_with()
        assert mocked_websocket == websocket_manager.active_connections[RUN_ID]["websocket"]

    @pytest.mark.asyncio
    async def test_disconnect(self, mocker, websocket_manager):
        mocked_websocket = mocker.MagicMock(spec=WebSocket)
        websocket_manager.active_connections[RUN_ID] = {"websocket": mocked_websocket, "chat": {}}
        websocket_manager.pending_tasks[mocked_websocket] = set()

        await websocket_manager.disconnect(RUN_ID, mocked_websocket)

        assert mocked_websocket not in websocket_manager.pending_tasks
        assert RUN_ID not in websocket_manager.active_connections

    @pytest.mark.asyncio
    async def test_send_process_output_to_websocket(self, mocker, websocket_manager):
        awaited_response = "Hello from DF-Designer"

        mocked_websocket = mocker.MagicMock(spec=WebSocket)
        websocket_manager.active_connections[RUN_ID] = {"websocket": mocked_websocket, "chat": {"messages": []}}

        websocket = mocker.AsyncMock()
        run_manager = mocker.MagicMock()
        run_process = mocker.MagicMock()
        run_process.read_stdout = mocker.AsyncMock(side_effect=[awaited_response.encode(), None])
        run_manager.processes = {RUN_ID: run_process}

        await websocket_manager.send_process_output_to_websocket(RUN_ID, run_manager, websocket)

        assert run_process.read_stdout.call_count == 2
        websocket.send_text.assert_awaited_once_with(awaited_response)

    @pytest.mark.asyncio
    async def test_forward_websocket_messages_to_process(self, mocker, websocket_manager):
        awaited_message = "Hello from DF-Designer"

        mocked_websocket = mocker.MagicMock(spec=WebSocket)
        websocket_manager.active_connections[RUN_ID] = {"websocket": mocked_websocket, "chat": {"messages": []}}

        websocket = mocker.AsyncMock()
        websocket.receive_text = mocker.AsyncMock(side_effect=[awaited_message, None])
        run_manager = mocker.MagicMock()
        run_process = mocker.MagicMock()
        run_process.write_stdin = mocker.AsyncMock()
        run_manager.processes = {RUN_ID: run_process}

        await websocket_manager.forward_websocket_messages_to_process(RUN_ID, run_manager, websocket)

        assert websocket.receive_text.await_count == 2
        run_process.write_stdin.assert_called_once_with(awaited_message.encode() + b"\n")
