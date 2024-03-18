import asyncio
from asyncio.tasks import Task
from fastapi import WebSocket, WebSocketDisconnect
from typing import Optional, Set, Dict

from app.core.logger_config import get_logger
from app.clients.process_manager import ProcessManager

logger = get_logger(__name__)

class WebSocketManager:
    def __init__(self):
        self.pending_tasks : Dict[WebSocket, Set[Task]] = dict()
        self.active_connections: list[WebSocket] = []


    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.pending_tasks:
            for task in self.pending_tasks[websocket]:
                task.cancel()
        self.active_connections.remove(websocket)

    def check_status(self, websocket: WebSocket):
        if websocket in self.active_connections:
            return websocket ## return Status!

    async def send_process_output_to_websocket(self, pid: int, process_manager: ProcessManager, websocket: WebSocket):
        """Read and forward process output to the websocket client.
        
        Args:
          pid: process_id, attribute of asyncio.subprocess.Process
        """
        try:
            while True:
                response = await process_manager.processes[pid].read_stdout()
                if not response:
                    break
                await websocket.send_text(response.decode().strip())
        except WebSocketDisconnect:
            self.disconnect(websocket)
            logger.info("Websocket connection is closed by client")

    async def forward_websocket_messages_to_process(self, pid: int, process_manager: ProcessManager, websocket: WebSocket):
        """Listen for messages from the websocket and send them to the subprocess.
        
        Args:
          pid: process_id, attribute of asyncio.subprocess.Process
        """
        try:
            while True:
                user_message = await websocket.receive_text()
                process_manager.processes[pid].write_stdin(user_message.encode() + b'\n')
        except asyncio.CancelledError:
            logger.info("Websocket connection is closed")
        except WebSocketDisconnect:
            self.disconnect(websocket)
            logger.info("Websocket connection is closed by client")
