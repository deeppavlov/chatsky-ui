"""
Process classes.
-----------------

Classes for build and run processes.
"""
import asyncio
import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

from app.core.config import settings
from app.core.logger_config import get_logger, setup_logging
from app.db.base import read_conf, write_conf
from app.schemas.process_status import Status

load_dotenv()

GRACEFUL_TERMINATION_TIMEOUT = float(os.getenv("GRACEFUL_TERMINATION_TIMEOUT", 2))
PING_PONG_TIMEOUT = float(os.getenv("PING_PONG_TIMEOUT", 0.5))


def _map_to_str(params: Dict[str, Any]):
    for k, v in params.items():
        if isinstance(v, datetime):
            params[k] = v.strftime("%Y-%m-%dT%H:%M:%S")
        elif isinstance(v, Path):
            params[k] = str(v)


class Process(ABC):
    """Base for build and run processes."""

    def __init__(self, id_: int, preset_end_status: str = ""):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: Status = Status.NULL
        self.timestamp: datetime = datetime.now()
        self.log_path: Path
        self.lock: asyncio.Lock = asyncio.Lock()
        self.process: asyncio.subprocess.Process  # pylint: disable=no-member #TODO: is naming ok?
        self.logger: logging.Logger

    async def start(self, cmd_to_run: str) -> None:
        """Starts an asyncronous process with the given command."""
        self.process = await asyncio.create_subprocess_exec(
            *cmd_to_run.split(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE,
        )

    async def get_full_info(self, attributes: list) -> Dict[str, Any]:
        """
        Get the values of the attributes mentioned in the list.

        Args:
            attributes (list): A list of attributes to get the values of.

        Returns:
            dict: A dictionary containing the values of the attributes mentioned in the list.
        """
        await self.check_status()
        info = {key: getattr(self, key) for key in self.__dict__ if key in attributes}
        if "status" in attributes:
            info["status"] = self.status.value

        return info

    @abstractmethod
    async def update_db_info(self):
        raise NotImplementedError

    async def periodically_check_status(self) -> None:
        """Periodically checks the process status and updates the database."""
        while True:
            await self.update_db_info()  # check status and update db
            self.logger.info("Status of process '%s': %s", self.id, self.status)
            if self.status in [Status.STOPPED, Status.COMPLETED, Status.FAILED]:
                break
            await asyncio.sleep(2)  # TODO: ?sleep time shouldn't be constant

    async def check_status(self) -> Status:
        """Returns the process current status.

        Returns:
            - Status.NULL: When a process is initiated but not started yet. This condition is unusual and typically
                indicates incorrect usage or a process misuse in backend logic.
            - Status.ALIVE: process is alive and ready to communicate
            - Status.RUNNING: process is still trying to get alive. no communication
            - Status.COMPLETED: returncode is 0
            - Status.FAILED: returncode is 1
            - Status.STOPPED: returncode is -15
            - Status.FAILED_WITH_UNEXPECTED_CODE: failed with other returncode
        """
        if self.process is None:
            self.status = Status.NULL
        # if process is already alive, don't interrupt potential open channels by checking status periodically.
        elif self.process.returncode is None:
            if self.status == Status.ALIVE:
                self.status = Status.ALIVE
            else:
                if await self.is_alive():
                    self.status = Status.ALIVE
                else:
                    self.status = Status.RUNNING

        elif self.process.returncode == 0:
            self.status = Status.COMPLETED
        elif self.process.returncode == 1:
            self.status = Status.FAILED
        elif self.process.returncode == -15:
            self.status = Status.STOPPED
        else:
            self.logger.error(
                "Unexpected code was returned: '%s'. A non-zero return code indicates an error.",
                self.process.returncode,
            )
            self.status = Status.FAILED_WITH_UNEXPECTED_CODE

        if self.status not in [Status.NULL, Status.RUNNING, Status.ALIVE, Status.STOPPED]:
            stdout, stderr = await self.process.communicate()
            if stdout:
                self.logger.info(f"[stdout]\n{stdout.decode()}")
            if stderr:
                self.logger.error(f"[stderr]\n{stderr.decode()}")

        return self.status

    async def stop(self) -> None:
        """Stops the process.

        Raises:
            ProcessLookupError: If the process doesn't exist or already exited.
            RuntimeError: If the process has not started yet.
        """
        if self.process is None:  # Check if a process has been started
            self.logger.error("Cannot stop a process '%s' that has not started yet.", self.id)
            raise RuntimeError
        try:
            self.logger.debug("Terminating process '%s'", self.id)
            self.process.terminate()
            try:
                await asyncio.wait_for(self.process.wait(), timeout=GRACEFUL_TERMINATION_TIMEOUT)
                self.logger.debug("Process '%s' was gracefully terminated.", self.id)
            except asyncio.TimeoutError:
                self.process.kill()
                await self.process.wait()
                self.logger.debug("Process '%s' was forcefully killed.", self.id)
            self.logger.debug("Process returencode '%s' ", self.process.returncode)

        except ProcessLookupError as exc:
            self.logger.error("Process '%s' not found. It may have already exited.", self.id)
            raise ProcessLookupError from exc

    async def read_stdout(self) -> bytes:
        """Reads the stdout of the process for communication."""
        async with self.lock:
            if self.process is None:
                self.logger.error("Cannot read stdout from a process '%s' that has not started yet.", self.id)
                raise RuntimeError
            if self.process.stdout is None:
                raise RuntimeError(f"The process '{self.id}' stdout is None. It might be still running.")
            return await self.process.stdout.readline()

    async def write_stdin(self, message: bytes) -> None:
        """Writes a message to the stdin of the process for communication."""
        if self.process is None:
            self.logger.error("Cannot write into stdin of a process '%s' that has not started yet.", self.id)
            raise RuntimeError
        if self.process.stdin is None:
            raise RuntimeError(f"The process '{self.id}' stdin is None. It might be still running.")
        self.process.stdin.write(message)
        await self.process.stdin.drain()

    async def is_alive(self) -> bool:
        """Checks if the process is alive by writing to stdin andreading its stdout."""
        message = b"Hi\n"
        try:
            # Attempt to write and read from the process with a timeout.
            await self.write_stdin(message)
            output = await asyncio.wait_for(self.read_stdout(), timeout=PING_PONG_TIMEOUT)
            if not output:
                return False
            self.logger.debug("Process is alive and output afer communication is: %s", output.decode())
            return True
        except asyncio.exceptions.TimeoutError:
            self.logger.debug("Process is still running.")
            return False


class RunProcess(Process):
    """Process for running a DFF pipeline."""

    def __init__(self, id_: int, build_id: int, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.build_id: int = build_id

        self.log_path: Path = setup_logging("runs", self.id, self.timestamp)
        self.logger = get_logger(str(id_), self.log_path)

    async def get_full_info(self, attributes: Optional[list] = None) -> Dict[str, Any]:
        if attributes is None:
            attributes = ["id", "preset_end_status", "status", "timestamp", "log_path", "build_id"]
        return await super().get_full_info(attributes)

    async def update_db_info(self) -> None:
        # save current run info into runs_path
        self.logger.debug("Updating db run info")
        runs_conf = await read_conf(settings.runs_path)

        run_params = await self.get_full_info()
        _map_to_str(run_params)

        for run in runs_conf:
            if run.id == run_params["id"]:  # type: ignore
                for key, value in run_params.items():
                    setattr(run, key, value)
                break
        else:
            runs_conf.append(run_params)

        await write_conf(runs_conf, settings.runs_path)

        # save current run id into the correspoinding build in builds_path
        builds_conf = await read_conf(settings.builds_path)
        for build in builds_conf:
            if build.id == run_params["build_id"]:  # type: ignore
                if run_params["id"] not in build.run_ids:  # type: ignore
                    build.run_ids.append(run_params["id"])  # type: ignore
                    break

        await write_conf(builds_conf, settings.builds_path)


class BuildProcess(Process):
    """Process for converting a frontned graph to a DFF script."""

    def __init__(self, id_: int, preset_end_status: str = ""):
        super().__init__(id_, preset_end_status)
        self.run_ids: List[int] = []

        self.log_path: Path = setup_logging("builds", self.id, self.timestamp)
        self.logger = get_logger(str(id_), self.log_path)

    async def get_full_info(self, attributes: Optional[list] = None) -> Dict[str, Any]:
        if attributes is None:
            attributes = ["id", "preset_end_status", "status", "timestamp", "log_path", "run_ids"]
        return await super().get_full_info(attributes)

    async def update_db_info(self) -> None:
        # save current build info into builds_path
        builds_conf = await read_conf(settings.builds_path)

        build_params = await self.get_full_info()
        _map_to_str(build_params)

        for build in builds_conf:
            if build.id == build_params["id"]:  # type: ignore
                for key, value in build_params.items():
                    setattr(build, key, value)
                break
        else:
            builds_conf.append(build_params)

        await write_conf(builds_conf, settings.builds_path)
