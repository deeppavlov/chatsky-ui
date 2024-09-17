"""
Websocket class for controling websocket operations.
"""
import asyncio
from asyncio.tasks import Task
from typing import Dict, List, Set
from uuid import uuid4

from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.services.process_manager import ProcessManager
from chatsky_ui.db.base import write_conf, read_conf_as_obj
from chatsky_ui.core.config import settings

class WebSocketManager:
    """Controls websocket operations connect, disconnect, check status, and communicate."""

    def __init__(self):
        self.pending_tasks: Dict[WebSocket, Set[Task]] = dict()
        self.active_connections: Dict[int, dict] = {}
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    async def connect(self, run_id: int, websocket: WebSocket):
        """Accepts the websocket connection and marks it as active connection."""
        await websocket.accept()

        ws_id = uuid4().hex
        self.active_connections[run_id] = {
            "websocket": websocket,
            "chat": {"id": ws_id, "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"), "messages": []},
        }

    async def close(self, run_id: int):
        """Closes an active websocket connection."""
        websocket = self.active_connections[run_id]["websocket"]
        await websocket.close()

    async def disconnect(
        self, run_id: int, websocket: WebSocket
    ):  # no need to pass websocket. use active_connections[run_id]
        """Executes cleanup.

        - Writes the chat info to DB.
        - Cancels pending tasks of the open websocket process.
        - Removes the websocket from active connections."""
        dict_chats = await read_conf_as_obj(settings.chats_path)
        dict_chats = dict_chats or []
        dict_chats.append(self.active_connections[run_id]["chat"])  # type: ignore
        await write_conf(dict_chats, settings.chats_path)
        logger.info("Chats info were written to DB")

        if websocket in self.pending_tasks:
            self.logger.info("Cancelling pending tasks")
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
                text = response.decode().strip()
                await websocket.send_text(text)
                self.active_connections[run_id]["chat"]["messages"].append(text)
        except WebSocketDisconnect:
            logger.info("Websocket connection is closed")
            await self.disconnect(run_id, websocket)
        except RuntimeError as e:
            if "Unexpected ASGI message 'websocket.send'" in str(
                e
            ) or "Cannot call 'send' once a close message has been sent" in str(e):
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
                self.active_connections[run_id]["chat"]["messages"].append(user_message)
        except asyncio.CancelledError:
            logger.info("Websocket connection is cancelled")
        except WebSocketDisconnect:
            logger.info("Websocket connection is closed")
            await self.disconnect(run_id, websocket)
        except RuntimeError as e:
            if "Unexpected ASGI message 'websocket.send'" in str(
                e
            ) or "Cannot call 'send' once a close message has been sent" in str(e):
                logger.info("Websocket connection was forced to close.")
            else:
                raise e
