import aiofiles
import asyncio
from datetime import datetime
from typing import List
from omegaconf import OmegaConf

from app.core.logger_config import get_logger
from app.core.config import settings

logger = get_logger(__name__)

class Process:
    def __init__(self, id_: int, preset_end_status = ""):
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

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            key: getattr(self, key) for key in self.__dict__ if key != "process"
        }

    def set_full_info(self, params_dict):
        for key, value in params_dict.items():
            setattr(self, key, value)

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

    async def stop(self):
        if self.process is None:  # Check if a process has been started
            raise RuntimeError(f"Cannot stop a process '{self.id}' that has not started yet.")
        try:
            logger.debug("Terminating process '%s'", self.id)
            self.process.terminate()
            await self.process.wait()
        except ProcessLookupError as exception:
            raise RuntimeError(f"Process '{self.id}' not found. It may have already exited.") from exception

    def read_stdout(self):
        if self.process is None:
            raise RuntimeError("Cannot read stdout from a process '{self.process.pid}' that has not started yet.")

        return self.process.stdout.readline()

    def write_stdin(self, message):
        if self.process is None:
            raise RuntimeError("Cannot write into stdin of a process '{self.process.pid}' that has not started yet.")
        self.process.stdin.write(message)


class RunProcess(Process):
    def __init__(self, id_: int, build_id: int = None, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.build_id: int = build_id

    def update_db_info(self):
        # save current run info into BUILDS_PATH
        runs_conf = settings.read_conf(settings.RUNS_PATH)
        run_params = self.get_full_info()
        run_params["timestamp"] = run_params["timestamp"].strftime("%Y-%m-%dT%H:%M:%S")
        for run in runs_conf:
            if run.id == run_params["id"]:
                for key, value in run_params.items():
                    setattr(run, key, value)
                break
        else:
            runs_conf.append(run_params)
        with open(settings.RUNS_PATH, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=runs_conf, f=file)

        # save current run info into the correspoinding build in BUILDS_PATH
        builds_conf = settings.read_conf(settings.BUILDS_PATH)
        for build in builds_conf:
            if build.id == run_params["build_id"]:
                build.runs.append({
                    param: v for param, v in run_params.items() if param not in ["build_id", "log_path"]
                })
        with open(settings.BUILDS_PATH, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=builds_conf, f=file)


class BuildProcess(Process):
    def __init__(self, id_: int, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.runs: List[int] = []

    def update_db_info(self):
        # save current run info into BUILDS_PATH
        builds_conf = settings.read_conf(settings.BUILDS_PATH)

        build_params = self.get_full_info()
        build_params["timestamp"] = build_params["timestamp"].strftime("%Y-%m-%dT%H:%M:%S")

        for build in builds_conf:
            if build.id == build_params["id"]:
                for key, value in build_params.items():
                    setattr(build, key, value)
                break
        else:
            builds_conf.append(build_params)

        with open(settings.BUILDS_PATH, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=builds_conf, f=file)
