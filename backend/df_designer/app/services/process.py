import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import List

import aiofiles

from app.core.config import settings
from app.core.logger_config import get_logger, setup_logging
from app.db.base import read_conf, write_conf


def _map_to_str(params: dict):
    for k, v in params.items():
        if isinstance(v, datetime):
            params[k] = v.strftime("%Y-%m-%dT%H:%M:%S")
        elif isinstance(v, Path):
            params[k] = str(v)


class Process:
    def __init__(self, id_: int, preset_end_status=""):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: str = "null"
        self.timestamp: datetime = datetime.now()
        self.log_path: Path
        self.process: asyncio.subprocess.Process  # pylint: disable=no-member #TODO: is naming ok?
        self.logger: logging.Logger

    async def start(self, cmd_to_run):
        async with aiofiles.open(self.log_path, "a", encoding="UTF-8"):  # TODO: log to files
            self.process = await asyncio.create_subprocess_exec(
                *cmd_to_run.split(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
            )

    def get_full_info(self) -> dict:
        self.check_status()
        return {key: getattr(self, key) for key in self.__dict__ if key not in ["process", "logger"]}

    def set_full_info(self, params_dict):
        for key, value in params_dict.items():
            setattr(self, key, value)

    async def update_db_info(self):
        pass

    async def periodically_check_status(self):
        while True:
            await self.update_db_info()  # check status and update db
            self.logger.info("Status of process '%s': %s", self.id, self.status)
            if self.status in ["stopped", "completed", "failed"]:
                break
            await asyncio.sleep(2)  # TODO: ?sleep time shouldn't be constant

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
                self.process.returncode,
            )
            return str(self.process.returncode)
        return self.status

    async def stop(self):
        if self.process is None:  # Check if a process has been started
            self.logger.error("Cannot stop a process '%s' that has not started yet.", self.id)
            raise RuntimeError
        try:
            self.logger.debug("Terminating process '%s'", self.id)
            self.process.terminate()
            await self.process.wait()
        except ProcessLookupError as exc:
            self.logger.error("Process '%s' not found. It may have already exited.", self.id)
            raise ProcessLookupError from exc

    def read_stdout(self):
        if self.process is None:
            self.logger.error("Cannot read stdout from a process '%s' that has not started yet.", self.id)
            raise RuntimeError

        return self.process.stdout.readline()

    async def write_stdin(self, message):
        if self.process is None:
            self.logger.error("Cannot write into stdin of a process '%s' that has not started yet.", self.id)
            raise RuntimeError
        self.process.stdin.write(message)
        await self.process.stdin.drain()


class RunProcess(Process):
    def __init__(self, id_: int, build_id: int = None, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.build_id: int = build_id

        log_name: str = "_".join([str(id_), datetime.now().time().strftime("%H%M%S")])
        self.log_path: Path = setup_logging("runs", log_name)
        self.logger = get_logger(str(id_), self.log_path)

    async def update_db_info(self):
        # save current run info into runs_path
        runs_conf = await read_conf(settings.runs_path)

        run_params = self.get_full_info()
        _map_to_str(run_params)

        for run in runs_conf:
            if run.id == run_params["id"]:
                for key, value in run_params.items():
                    setattr(run, key, value)
                break
        else:
            runs_conf.append(run_params)

        await write_conf(runs_conf, settings.runs_path)

        # save current run info into the correspoinding build in builds_path
        builds_conf = await read_conf(settings.builds_path)
        for build in builds_conf:
            if build.id == run_params["build_id"]:
                for run in build.runs:
                    if run.id == run_params["id"]:
                        for key, value in run_params.items():
                            setattr(run, key, value)
                        break
                else:
                    build.runs.append(run_params)
        await write_conf(builds_conf, settings.builds_path)


class BuildProcess(Process):
    def __init__(self, id_: int, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.runs: List[int] = []

        log_name: str = "_".join([str(id_), datetime.now().time().strftime("%H%M%S")])
        self.log_path: Path = setup_logging("builds", log_name)
        self.logger = get_logger(str(id_), self.log_path)

    async def update_db_info(self):
        # save current build info into builds_path
        builds_conf = await read_conf(settings.builds_path)

        build_params = self.get_full_info()
        _map_to_str(build_params)

        for build in builds_conf:
            if build.id == build_params["id"]:
                for key, value in build_params.items():
                    setattr(build, key, value)
                break
        else:
            builds_conf.append(build_params)

        await write_conf(builds_conf, settings.builds_path)
