import aiofiles
import asyncio
from datetime import datetime
from typing import List
from pathlib import Path

from app.core.logger_config import get_logger

logger = get_logger(__name__)

class Process:
    def __init__(self, id_: int, preset_end_status: str):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: str = "null"
        self.timestamp: datetime = datetime.now()
        self.log_path: Path = Path("./logs/")
        self.process: asyncio.subprocess.Process = None # pylint: disable=no-member #TODO: is naming ok? 

    async def start(self, cmd_to_run):
        async with aiofiles.open("process_io.log", "a", encoding="UTF-8") as file: #TODO: log to files
            self.process = await asyncio.create_subprocess_exec(
                *cmd_to_run.split(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
            )
            self.pid = self.process.pid

    def check_status(self):
        if self.process is None:
            return "Process has not been started."
        elif self.process.returncode is None:
            return "Running"
        else:
            return f"Exited with return code: {self.process.returncode}. A non-zero return code indicates an error."

    def stop(self):
        if self.process is None:  # Check if a process has been started
            raise RuntimeError("Cannot stop a process '{self.pid}' that has not started yet.")
        try:
            logger.debug("Terminating process '%s'", self.process.pid)
            self.process.terminate()
        except ProcessLookupError as exception:
            raise RuntimeError(f"Process '{self.process.pid}' not found. It may have already exited.") from exception

    def read_stdout(self):
        if self.process is None:
            raise RuntimeError("Cannot read stdout from a process '{self.process.pid}' that has not started yet.")

        return self.process.stdout.readline()

    def write_stdin(self, message):
        if self.process is None:
            raise RuntimeError("Cannot write into stdin of a process '{self.process.pid}' that has not started yet.")
        self.process.stdin.write(message)


class RunProcess(Process):
    def __init__(self, id_: int, preset_end_status: str):# build_id:int, 
        super().__init__(id_, preset_end_status)
        # self.build_id: int = build_id

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            "run_id": self.id,
            # "build_id": self.build_id,
            "run_preset_name": self.preset_end_status,
            "status": self.status,
            "timestamp": self.timestamp,
            "log_path": self.log_path,
        }


class BuildProcess(Process):
    def __init__(self, id_: int, preset_end_status: str):
        super().__init__(id_, preset_end_status)
        self.run_ids: List[int] = []

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            "build_id": self.id,
            "build_preset_name": self.preset_end_status,
            "status": self.status,
            "timestamp": self.timestamp,
            "log_path": self.log_path,
            "run_ids": self.run_ids,
        }
