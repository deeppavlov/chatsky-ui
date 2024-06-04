import asyncio
from fastapi import WebSocket

from app.core.logger_config import get_logger
from app import Process

logger = get_logger(__name__)

class ProcessManager:
    def __init__(self):
        self.processes = {}

    async def start(self, cmd_to_run):
        process = Process()
        await process.start(cmd_to_run)
        self.processes[process.pid] = process

    def get_last_id(self):
        """Get the process_id of the last started process"""
        return list(self.processes.keys())[-1]

    def stop(self, pid):
        self.processes[pid].stop()
        self.processes.pop(pid)

    def check_status(self, pid):
        return self.processes[pid].check_status()

    def get_all(self):
        return self.processes
