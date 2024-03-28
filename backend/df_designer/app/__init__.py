import aiofiles
import asyncio
from datetime import datetime
import logging
from pathlib import Path
import time
from typing import List
from omegaconf import OmegaConf

from app.core.logger_config import get_logger, setup_logging
from app.core.config import settings


def _map_to_str(params: dict):
    for k, v in params.items():
        if isinstance(v, datetime):
            params[k] = v.strftime("%Y-%m-%dT%H:%M:%S")
        elif isinstance(v, Path):
            params[k] = str(v)


class Process:
    def __init__(self, id_: int, preset_end_status = ""):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: str = "null"
        self.timestamp: datetime = datetime.now()
        self.log_path: Path
        self.process: asyncio.subprocess.Process # pylint: disable=no-member #TODO: is naming ok? 
        self.logger: logging.Logger

    async def start(self, cmd_to_run):
        async with aiofiles.open(self.log_path, "a", encoding="UTF-8") as file: #TODO: log to files
            self.process = await asyncio.create_subprocess_exec(
                *cmd_to_run.split(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
            )

    def get_full_info(self) -> dict:
        self.check_status()
        return {
            key: getattr(self, key) for key in self.__dict__ if key not in ["process", "logger"]
        }

    def set_full_info(self, params_dict):
        for key, value in params_dict.items():
            setattr(self, key, value)

    def update_db_info(self):
        pass

    def periodically_check_status(self):
        while True:
            self.update_db_info() # check status and update db
            self.logger.info("Status of process '%s': %s",self.id, self.status)
            if self.status in ["stopped", "completed", "failed"]:
                break
            time.sleep(2) #TODO: ?sleep time shouldn't be constant

    def check_status(self) -> str:
        """Returns the process status [null, running, completed, failed, stopped].
        - null: When a process is initiated but not started yet. This condition is unusual and typically indicates
        incorrect usage or a process misuse in backend logic.
        - running: returncode is None
        - completed: returncode is 0
        - failed: returncode is 1
        - stopped: returncode is -15
        - "Exited with return code: {self.process.returncode}. A non-zero return code indicates an error": Otherwise
        """
        if self.process is None:
            self.status = "null"
        elif self.process.returncode is None:
            self.status = "running"
        elif self.process.returncode == 0:
            self.status = "completed"
        elif self.process.returncode == 1:
            self.status = "failed"
        elif self.process.returncode == -15:
            self.status = "stopped"
        else:
            self.logger.warning(
                "Unexpected code was returned: '%s'. A non-zero return code indicates an error.",
                self.process.returncode
            )
            return str(self.process.returncode)
        return self.status

    async def stop(self):
        if self.process is None:  # Check if a process has been started
            raise RuntimeError(f"Cannot stop a process '{self.id}' that has not started yet.")
        try:
            self.logger.debug("Terminating process '%s'", self.id)
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

        log_name: str = "_".join([str(id_), datetime.now().time().strftime("%H%M%S")])
        self.log_path: Path = setup_logging("runs", log_name)
        self.logger = get_logger(str(id_), self.log_path)

    def update_db_info(self):
        # save current run info into RUNS_PATH
        runs_conf = settings.read_conf(settings.RUNS_PATH)

        run_params = self.get_full_info()
        _map_to_str(run_params)

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
                for run in build.runs:
                    if run.id == run_params["id"]:
                        for key, value in run_params.items():
                            setattr(run, key, value)
                        break
                else:
                    build.runs.append(run_params)
        with open(settings.BUILDS_PATH, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=builds_conf, f=file)


class BuildProcess(Process):
    def __init__(self, id_: int, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.runs: List[int] = []

        log_name: str = "_".join([str(id_), datetime.now().time().strftime("%H%M%S")])
        self.log_path: Path = setup_logging("builds", log_name)
        self.logger = get_logger(str(id_), self.log_path)

    def update_db_info(self):
        # save current build info into BUILDS_PATH
        builds_conf = settings.read_conf(settings.BUILDS_PATH)

        build_params = self.get_full_info()
        _map_to_str(build_params)

        for build in builds_conf:
            if build.id == build_params["id"]:
                for key, value in build_params.items():
                    setattr(build, key, value)
                break
        else:
            builds_conf.append(build_params)

        with open(settings.BUILDS_PATH, "w", encoding="UTF-8") as file:
            OmegaConf.save(config=builds_conf, f=file)
