"""
Websocket class for controling websocket operations.
"""
import asyncio
from asyncio.tasks import Task
from typing import Dict, List, Set

from fastapi import WebSocket, WebSocketDisconnect

from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.services.process_manager import ProcessManager


class WebSocketManager:
    """Controls websocket operations connect, disconnect, check status, and communicate."""

    def __init__(self):
        self.pending_tasks: Dict[WebSocket, Set[Task]] = dict()
        self.active_connections: List[WebSocket] = []
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    async def connect(self, websocket: WebSocket):
        """Accepts the websocket connection and marks it as active connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Cancels pending tasks of the open websocket process and removes it from active connections."""
        # TODO: await websocket.close()
        if websocket in self.pending_tasks:
            self.logger.info("Cancelling pending tasks")
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
        """Reads and forwards process output to the websocket client."""
        try:
            while True:
                response = await process_manager.processes[run_id].read_stdout()
                if not response:
                    break
                await websocket.send_text(response.decode().strip())
        except WebSocketDisconnect:
            self.logger.info("Websocket connection is closed by client")
        except RuntimeError:
            raise

    async def forward_websocket_messages_to_process(
        self, run_id: int, process_manager: ProcessManager, websocket: WebSocket
    ):
        """Listens for messages from the websocket and sends them to the process."""
        try:
            while True:
                user_message = await websocket.receive_text()
                if not user_message:
                    break
                await process_manager.processes[run_id].write_stdin(user_message.encode() + b"\n")
        except asyncio.CancelledError:
            self.logger.info("Websocket connection is closed")
        except WebSocketDisconnect:
            self.logger.info("Websocket connection is closed by client")
        except RuntimeError:
            raise
