import asyncio
from asyncio.tasks import Task
from typing import Dict, Set

from fastapi import WebSocket, WebSocketDisconnect

from app.core.logger_config import get_logger
from app.services.process_manager import ProcessManager

logger = get_logger(__name__)


class WebSocketManager:
    def __init__(self):
        self.pending_tasks: Dict[WebSocket, Set[Task]] = dict()
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # TODO: await websocket.close()
        if websocket in self.pending_tasks:
            logger.info("Cancelling pending tasks")
            for task in self.pending_tasks[websocket]:
                task.cancel()
            del self.pending_tasks[websocket]
        self.active_connections.remove(websocket)

    def check_status(self, websocket: WebSocket):
        if websocket in self.active_connections:
            return websocket  # return Status!

    async def send_process_output_to_websocket(
        self, run_id: int, process_manager: ProcessManager, websocket: WebSocket
    ):
        """Read and forward process output to the websocket client."""
        try:
            while True:
                response = await process_manager.processes[run_id].read_stdout()
                if not response:
                    break
                await websocket.send_text(response.decode().strip())
        except WebSocketDisconnect:
            logger.info("Websocket connection is closed by client")
        except RuntimeError as exc:
            raise exc

    async def forward_websocket_messages_to_process(
        self, run_id: int, process_manager: ProcessManager, websocket: WebSocket
    ):
        """Listen for messages from the websocket and send them to the subprocess."""
        try:
            while True:
                user_message = await websocket.receive_text()
                if not user_message:
                    break
                await process_manager.processes[run_id].write_stdin(user_message.encode() + b"\n")
        except asyncio.CancelledError:
            logger.info("Websocket connection is closed")
        except WebSocketDisconnect:
            logger.info("Websocket connection is closed by client")
        except RuntimeError as exc:
            raise exc
