"""
Process classes.
-----------------

Classes for build and run processes.
"""
import asyncio
import logging
import os
import signal
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from httpx import AsyncClient

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger, setup_logging
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.schemas.process_status import Status
from chatsky_ui.utils.git_cmd import get_repo, save_built_script_to_git

load_dotenv()

GRACEFUL_TERMINATION_TIMEOUT = float(os.getenv("GRACEFUL_TERMINATION_TIMEOUT", 2))
PING_PONG_TIMEOUT = float(os.getenv("PING_PONG_TIMEOUT", 0.5))


class Process(ABC):
    """Base for build and run processes."""

    def __init__(self, id_: int, preset_end_status: str = ""):
        self.id: int = id_
        self.preset_end_status: str = preset_end_status
        self.status: Status = Status.NULL
        self.timestamp: datetime = datetime.now()
        self.log_path: Path
        self.lock: asyncio.Lock = asyncio.Lock()
        self.process: Optional[asyncio.subprocess.Process] = None
        self.logger: logging.Logger
        self.to_be_terminated = False

    async def start(self, cmd_to_run: str) -> None:
        """Starts an asyncronous process with the given command."""
        self.process = await asyncio.create_subprocess_exec(
            *cmd_to_run.split(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE,
            preexec_fn=os.setsid,
        )

    async def get_full_info(self, attributes: list) -> Dict[str, Any]:
        """
        Get the values of the attributes mentioned in the list.

        Args:
            attributes (list): A list of attributes to get the values of.

        Returns:
            dict: A dictionary containing the values of the attributes mentioned in the list.
        """

        def _map_to_str(params: Dict[str, Any]):
            for k, v in params.copy().items():
                if isinstance(v, datetime):
                    params[k] = v.strftime("%Y-%m-%dT%H:%M:%S")
                elif isinstance(v, Path):
                    params[k] = str(v)
            return params

        await self.check_status()
        info = {key: getattr(self, key) for key in self.__dict__ if key in attributes}
        if "status" in attributes:
            info["status"] = self.status.value

        return _map_to_str(info)

    @abstractmethod
    async def update_db_info(self):
        raise NotImplementedError

    async def periodically_check_status(self) -> None:
        """Periodically checks the process status and updates the database."""
        while not self.to_be_terminated:
            await self.update_db_info()  # check status and update db
            self.logger.info("Status of process '%s': %s", self.id, self.status)
            if self.status in [
                Status.NULL,
                Status.STOPPED,
                Status.COMPLETED,
                Status.FAILED,
                Status.FAILED_WITH_UNEXPECTED_CODE,
            ]:
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
            return self.status
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

        if self.status not in [Status.NULL, Status.RUNNING, Status.ALIVE]:
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
            self.logger.debug("Terminating process '%s' with group process pid of '%s'", self.id, self.process.pid)
            os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            try:
                await asyncio.wait_for(self.process.wait(), timeout=GRACEFUL_TERMINATION_TIMEOUT)
                self.logger.debug("Process '%s' was gracefully terminated.", self.id)
            except asyncio.TimeoutError:
                os.killpg(os.getpgid(self.process.pid), signal.SIGKILL)
                self.logger.debug("Process '%s' was forcefully killed.", self.id)
            self.logger.debug("Process returencode '%s' ", self.process.returncode)
        except ProcessLookupError as exc:
            self.logger.error("Process group '%s' not found. It may have already exited.", self.id)
            raise ProcessLookupError from exc

    def add_new_conf(self, conf: list, params: dict) -> list:  # TODO: rename conf everywhere to metadata/meta
        for run in conf:
            if run.id == params["id"]:  # type: ignore
                for key, value in params.items():
                    setattr(run, key, value)
                break
        else:
            conf.append(params)

        return conf


class RunProcess(Process):
    """Process for running a Chatsky pipeline."""

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

        runs_conf = self.add_new_conf(runs_conf, run_params)  # type: ignore

        await write_conf(runs_conf, settings.runs_path)

        # save current run id into the correspoinding build in builds_path
        builds_conf = await read_conf(settings.builds_path)
        for build in builds_conf:
            if build.id == run_params["build_id"]:  # type: ignore
                if run_params["id"] not in build.run_ids:  # type: ignore
                    build.run_ids.append(run_params["id"])  # type: ignore
                    break

        await write_conf(builds_conf, settings.builds_path)

    async def is_alive(self) -> bool:
        """Checks if the process is alive by writing to stdin andreading its stdout."""

        async def check_telegram_readiness(stream, name):
            async for line in stream:
                decoded_line = line.decode().strip()
                self.logger.info(f"[{name}] {decoded_line}")

                if "telegram.ext.Application:Application started" in decoded_line:
                    self.logger.info("The application is ready for use!")
                    return True
            return False

        async with AsyncClient() as client:
            try:
                response = await client.get(
                    f"http://localhost:{settings.chatsky_port}/health",
                )
                return response.json()["status"] == "ok"
            except Exception as e:
                self.logger.info(
                    f"Process '{self.id}' isn't alive on port '{settings.chatsky_port}' yet. "
                    f"Ignore this if you're not connecting via HTTPInterface. Exception caught: {e}"
                )

        done, pending = await asyncio.wait(
            [
                asyncio.create_task(check_telegram_readiness(self.process.stdout, "STDOUT")),
                asyncio.create_task(check_telegram_readiness(self.process.stderr, "STDERR")),
            ],
            return_when=asyncio.FIRST_COMPLETED,
            timeout=PING_PONG_TIMEOUT,
        )

        for task in pending:
            task.cancel()

        for task in done:
            result = task.result()
            if result:
                return result

        return False


class BuildProcess(Process):
    """Process for converting a frontned graph to a Chatsky script."""

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
        """Saves current build info into builds_path"""
        builds_conf = await read_conf(settings.builds_path)
        build_params = await self.get_full_info()

        builds_conf = self.add_new_conf(builds_conf, build_params)  # type: ignore

        await write_conf(builds_conf, settings.builds_path)

    def save_built_script_to_git(self, id_: int) -> None:
        bot_repo = get_repo(settings.custom_dir.parent)
        save_built_script_to_git(id_, bot_repo)

    async def periodically_check_status(self) -> None:
        """Periodically checks the process status and updates the database."""
        while not self.to_be_terminated:
            await self.update_db_info()  # check status and update db
            self.logger.info("Status of process '%s': %s", self.id, self.status)
            if self.status in [Status.NULL, Status.STOPPED, Status.COMPLETED, Status.FAILED]:
                self.save_built_script_to_git(self.id)
                break
            await asyncio.sleep(2)  # TODO: ?sleep time shouldn't be constant

    async def is_alive(self) -> bool:
        return False
