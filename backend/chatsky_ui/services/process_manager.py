"""
Process manager
----------------

Process managers are used to manage run and build processes. They are responsible for
starting, stopping, updating, and checking status of processes. Processes themselves
are stored in the `processes` dictionary of process managers.
"""
import asyncio
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import socket

from dotenv import load_dotenv
from omegaconf import OmegaConf

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, read_logs
from chatsky_ui.schemas.preset import BuildPreset, RunPreset
from chatsky_ui.schemas.process_status import Status
from chatsky_ui.services.process import BuildProcess, RunProcess
from chatsky_ui.utils.repo_manager import RepoManager


class ProcessManager:
    """Base for build and run process managers."""

    def __init__(self):
        self.processes: Dict[int, Union[BuildProcess, RunProcess]] = {}
        self.last_id: int
        self._logger = None
        self._bot_repo_manager = None
        self._graph_repo_manager = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    @property
    def bot_repo_manager(self):
        if self._bot_repo_manager is None:
            raise ValueError("Bot repo manager has not been set. Call set_bot_repo_manager() first.")
        return self._bot_repo_manager

    @property
    def graph_repo_manager(self):
        if self._graph_repo_manager is None:
            raise ValueError("Graph repo manager has not been set. Call set_graph_repo_manager() first.")
        return self._graph_repo_manager

    def set_bot_repo_manager(self):
        self._bot_repo_manager = RepoManager(settings.custom_dir.parent)
        self.logger.debug("settings.custom_dir.parent: %s", str(settings.custom_dir.parent))
        self.bot_repo_manager.set_logger()

    def set_graph_repo_manager(self):
        self._graph_repo_manager = RepoManager(settings.frontend_flows_path.parent)
        self.logger.debug("settings.frontend_flows_path.parent: %s", str(settings.frontend_flows_path.parent))
        self.graph_repo_manager.set_logger()

    def get_last_id(self):
        """Gets the maximum id among processes of type BuildProcess or RunProcess."""
        return self.last_id

    async def stop(self, id_: int) -> None:
        """Stops the process with the given id.

        raises:
            ProcessLookupError: If the process with the given id is not found.
            RuntimeError: If the process has not started yet.
        """
        if id_ not in self.processes:
            self.logger.error("Process with id '%s' not found in recent running processes", id_)
            raise ProcessLookupError
        try:
            await self.processes[id_].stop()
        except (RuntimeError, ProcessLookupError):
            raise

    async def stop_all(self) -> None:
        for id_, process in self.processes.items():
            if await process.check_status() in [Status.ALIVE, Status.RUNNING]:
                await self.stop(id_)
                await process.update_db_info()

    async def check_status(self, id_: int, *args, **kwargs) -> None:
        """Checks the status of the process with the given id by periodically checking status`
        of the process.

        This updates the process status in the database every 2 seconds.
        """
        process = self.processes[id_]
        while not process.to_be_terminated:
            await process.update_db_info()  # check status and update db
            process.logger.info("Status of process '%s': %s", process.id, process.status)
            if process.status in [
                Status.NULL,
                Status.STOPPED,
                Status.COMPLETED,
                Status.FAILED,
                Status.FAILED_WITH_UNEXPECTED_CODE,
            ]:
                break
            await asyncio.sleep(2)  # TODO: ?sleep time shouldn't be constant

    async def get_status(self, id_: int) -> Status:
        """Checks the status of the process with the given id by calling the `check_status` method of the process."""
        return await self.processes[id_].check_status()

    async def get_process_info(self, id_: int, path: Path) -> Optional[Dict[str, Any]]:
        """Returns metadata of a specific process identified by its unique ID."""
        db_conf = await read_conf(path)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return next((db_process for db_process in conf_dict if db_process["id"] == id_), None)  # type: ignore

    async def get_full_info(self, offset: int, limit: int, path: Path) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset``th process."""

        db_conf = await read_conf(path)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return conf_dict[offset : offset + limit]  # type: ignore

    async def fetch_process_logs(self, id_: int, offset: int, limit: int, path: Path) -> Optional[List[str]]:
        """Returns the logs of one process according to its id. If the process is not found, returns None."""
        process_info = await self.get_process_info(id_, path)
        if process_info is None:
            self.logger.error("Id '%s' not found", id_)
            return None

        log_file = Path(process_info["log_path"])
        try:
            logs = await read_logs(log_file)
            logs = [log for log in logs if log.strip()]
        except FileNotFoundError:
            self.logger.error("Log file '%s' not found", log_file)
            return None

        if offset > len(logs):
            self.logger.info("Offset '%s' is out of bounds ('%s' logs found)", offset, len(logs))
            return None  # TODO: raise error!

        self.logger.info("Returning %s logs", len(logs))
        return logs[offset : offset + limit]


class RunManager(ProcessManager):
    """Process manager for running a Chatsky pipeline."""

    async def start(self, build_id: int, preset: RunPreset) -> int:
        """Starts a new run process.

        Increases the maximum existing id by 1 and assigns it to the new process.
        Starts the process and appends it to the processes list.

        Args:
            build_id (int): the build id to run
            preset (Preset): the preset to use among ("success", "failure", "loop")

        Returns:
            int: the id of the new started process
        """
        self.bot_repo_manager.checkout_tag(build_id, "scripts/build.yaml")
        cmd_to_run = f"chatsky.ui run_bot " f"--preset {preset.end_status} " f"--project-dir {settings.work_directory}"
        self.last_id = max([run["id"] for run in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id
        process = RunProcess(id_, build_id, preset)

        load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)
        await process.start(cmd_to_run)
        process.logger.debug("Started process. status: '%s'", process.process.returncode)
        self.processes[id_] = process

        return self.last_id

    async def get_run_info(self, id_: int) -> Optional[Dict[str, Any]]:
        """Returns metadata of  a specific run process identified by its unique ID."""
        return await super().get_process_info(id_, settings.runs_path)

    async def get_full_info(self, offset: int, limit: int, path: Path = None) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of run processes, starting from the ``offset``th process."""
        path = path or settings.runs_path
        return await super().get_full_info(offset, limit, path)

    async def fetch_run_logs(self, run_id: int, offset: int, limit: int) -> Optional[List[str]]:
        """Returns the logs of one run according to its id.

        Number of loglines returned is based on `offset` as the start line and limited by `limit` lines.
        """
        return await self.fetch_process_logs(run_id, offset, limit, settings.runs_path)


class BuildManager(ProcessManager):
    """Process manager for converting a frontned graph to a Chatsky script."""

    async def _get_available_port(self) -> int:
        def _is_available_port(port):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", port)) != 0

        async def _get_busy_ports():
            builds_metadata = await self.get_full_info(0, 10000)
            return [build["port"] for build in builds_metadata if build["port"] is not None]

        busy_ports = await _get_busy_ports()
        if busy_ports:
            port = max(busy_ports) + 1
        else:
            port = 8001

        while not _is_available_port(port):
            port += 1
        return port

    async def start(self, preset: BuildPreset) -> int:
        """Starts a new build process.

        Increases the maximum existing id by 1 and assigns it to the new process.
        Starts the process and appends it to the processes list.

        Args:
            preset (Preset): the preset to use among ("success", "failure", "loop")

        Returns:
            int: the id of the new started process
        """
        self.last_id = max([build["id"] for build in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id

        if self.bot_repo_manager.is_repeated_tag(id_):
            raise ValueError(f"Build id '{id_}' already exists in the database")

        if preset.messanger == "web":
            port = await self._get_available_port()
            self.logger.debug("Available port: %s", port)
        else:
            port = None
        process = BuildProcess(id_, port, preset)
        cmd_to_run = (
            f"chatsky.ui build_bot " f"--preset {preset.end_status} " f"--project-dir {settings.work_directory}"
        )
        if port is not None:
            cmd_to_run += f" --chatsky-port {port}"

        await process.start(cmd_to_run)
        self.processes[id_] = process

        return id_

    async def check_status(self, id_: int, *args, **kwargs) -> None:
        """Checks the status of the process with the given id by periodically checking status`
        of the process.

        This updates the process status in the database every 2 seconds.
        """
        process = self.processes[id_]
        while not process.to_be_terminated:
            await process.update_db_info()  # check status and update db
            process.logger.info("Status of process '%s': %s", process.id, process.status)
            if process.status in [
                Status.NULL,
                Status.STOPPED,
                Status.COMPLETED,
                Status.FAILED,
                Status.FAILED_WITH_UNEXPECTED_CODE,
            ]:
                self.bot_repo_manager.commit_with_tag(process.id)
                self.graph_repo_manager.commit_with_tag(process.id)
                break

    async def get_build_info(self, id_: int, run_manager: RunManager) -> Optional[Dict[str, Any]]:
        """Returns metadata of a specific build process identified by its unique ID.

        Args:
            ``id_`` (int): the id of the build
            ``run_manager`` (RunManager): the run manager to use for getting all runs of this build
        """
        builds_info = await self.get_full_info_with_runs_info(run_manager, offset=0, limit=10**5)
        return next((build for build in builds_info if build["id"] == id_), None)

    async def get_full_info(self, offset: int, limit: int, path: Path = None) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset`` process."""
        path = path or settings.builds_path
        return await super().get_full_info(offset, limit, path)

    async def get_full_info_with_runs_info(
        self, run_manager: RunManager, offset: int, limit: int
    ) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset``th process.

        Args:
            run_manager (RunManager): the run manager to use for getting all runs of this build
        """
        builds_info = await self.get_full_info(offset=offset, limit=limit)
        runs_info = await run_manager.get_full_info(offset=0, limit=10**5)
        for build in builds_info:
            del build["run_ids"]
            build["runs"] = []
            for run in runs_info:
                if build["id"] == run["build_id"]:
                    run_without_build_id = {k: v for k, v in run.items() if k != "build_id"}
                    build["runs"].append(run_without_build_id)

        return builds_info

    async def fetch_build_logs(self, build_id: int, offset: int, limit: int) -> Optional[List[str]]:
        """Returns the logs of one build according to its id.

        Number of loglines returned is based on `offset` as the start line and limited by `limit` lines.
        """
        return await self.fetch_process_logs(build_id, offset, limit, settings.builds_path)
