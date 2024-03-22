import aiofiles
import asyncio
from datetime import datetime
from typing import List
from pathlib import Path
from omegaconf import OmegaConf

from app.core.logger_config import get_logger
from app.core.config import settings

logger = get_logger(__name__)

class Process:
    def __init__(self, id_: int, preset_end_status: str):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: str = "null"
        self.timestamp: datetime = datetime.now()
        self.log_path: str = "./logs/"
        self.process: asyncio.subprocess.Process = None # pylint: disable=no-member #TODO: is naming ok? 

    async def start(self, cmd_to_run):
        async with aiofiles.open("process_io.log", "a", encoding="UTF-8") as file: #TODO: log to files
            self.process = await asyncio.create_subprocess_exec(
                *cmd_to_run.split(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
            )

    def check_status(self) -> str:
        """Returns the process status [null, Running, Completed, Failed, Stopped].
        - null: When a process is initiated but not started yet. This condition is unusual and typically indicates
        incorrect usage or a process misuse in backend logic.
        - Running: returncode is None
        - Completed: returncode is 0
        - Failed: returncode is 1
        - Stopped: returncode is -15
        - "Exited with return code: {self.process.returncode}. A non-zero return code indicates an error": Otherwise
        """
        if self.process is None:
            self.status = "null"
        elif self.process.returncode is None:
            self.status = "Running"
        elif self.process.returncode == 0:
            self.status = "Completed"
        elif self.process.returncode == 1:
            self.status = "Failed"
        elif self.process.returncode == -15:
            self.status = "Stopped"
        else:
            logger.warning(
                "Unexpected code was returned: '%s'. A non-zero return code indicates an error.",
                self.process.returncode
            )
            return str(self.process.returncode)
        return self.status

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
        self.save_process() # TODO: Think about this. The status is still null in this stage !!

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            "id": self.id,
            "build_id": 43,#TODO: self.build_id,
            "run_preset_name": self.preset_end_status,
            "status": self.status,
            "timestamp": self.timestamp,
            "log_path": self.log_path,
        }
    
    def save_process(self):
        # save current run info into RUNS_PATH
        runs_path = Path(settings.RUNS_PATH)
        runs_conf = OmegaConf.load(runs_path)

        run_params = self.get_full_info()
        run_params["timestamp"] = run_params["timestamp"].strftime("%Y-%m-%dT%H:%M:%S")

        runs_conf.append(run_params)
        with open(runs_path, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=runs_conf, f=file)

        # save current run info into the correspoinding build in BUILDS_PATH
        builds_path = Path(settings.BUILDS_PATH)
        builds_conf = OmegaConf.load(builds_path)
        for build in builds_conf:
            if "id" in build and build.id == run_params["build_id"]:
                if not build.runs:
                    build.runs = []
                build.runs.append({
                    param: v for param, v in run_params.items() if param not in ["build_id", "log_path"]
                })
        with open(builds_path, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=builds_conf, f=file)


class BuildProcess(Process):
    def __init__(self, id_: int, preset_end_status: str):
        super().__init__(id_, preset_end_status)
        self.runs: List[int] = []

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            "id": self.id,
            "build_preset_name": self.preset_end_status,
            "status": self.status,
            "timestamp": self.timestamp,
            "log_path": self.log_path,
            "runs": self.runs,
        }
