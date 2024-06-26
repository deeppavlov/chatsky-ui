"""
Websocket class for controling websocket operations.
"""
import asyncio
from asyncio.tasks import Task
from typing import Dict, Set

from fastapi import WebSocket, WebSocketDisconnect

from app.core.logger_config import get_logger
from app.services.process_manager import ProcessManager

logger = get_logger(__name__)


class WebSocketManager:
    """Controls websocket operations connect, disconnect, check status, and communicate."""

    def __init__(self):
        self.pending_tasks: Dict[WebSocket, Set[Task]] = dict()
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, run_id: int, websocket: WebSocket):
        """Accepts the websocket connection and marks it as active connection."""
        await websocket.accept()
        self.active_connections.update({run_id: websocket})

    async def close(self, run_id: int):
        """Closes an active websocket connection."""
        websocket = self.active_connections[run_id]
        await websocket.close()

    def disconnect(self, run_id:int, websocket: WebSocket): # no need to pass websocket. use active_connections[run_id]
        """Cancels pending tasks of the open websocket process and removes it from active connections."""
        if websocket in self.pending_tasks:
            logger.info("Cancelling pending tasks")
            for task in self.pending_tasks[websocket]:
                task.cancel()
            del self.pending_tasks[websocket]
        del self.active_connections[run_id]

    def is_connected(self, run_id: int):
        """Returns True if the run_id is connected to a websocket, False otherwise."""
        return run_id in self.active_connections

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
            logger.info("Websocket connection is closed")
            self.disconnect(run_id, websocket)
        except RuntimeError as e:
            if "Unexpected ASGI message 'websocket.send'" in str(e) or "Cannot call 'send' once a close message has been sent" in str(e):
                logger.info("Websocket connection was forced to close.")
            else:
                raise e

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
            logger.info("Websocket connection is cancelled")
        except WebSocketDisconnect:
            logger.info("Websocket connection is closed")
            self.disconnect(run_id, websocket)
        except RuntimeError as e:
            if "Unexpected ASGI message 'websocket.send'" in str(e) or "Cannot call 'send' once a close message has been sent" in str(e):
                logger.info("Websocket connection was forced to close.")
            else:
                raise e
