"""
Process manager
----------------

Process managers are used to manage run and build processes. They are responsible for
starting, stopping, updating, and checking status of processes. Processes themselves
are stored in the `processes` dictionary of process managers.
"""
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from dotenv import load_dotenv
from omegaconf import OmegaConf

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, read_logs
from chatsky_ui.schemas.preset import Preset
from chatsky_ui.schemas.process_status import Status
from chatsky_ui.services.process import BuildProcess, RunProcess
from chatsky_ui.utils.git_cmd import get_repo, save_frontend_graph_to_git


class ProcessManager:
    """Base for build and run process managers."""

    def __init__(self):
        self.processes: Dict[int, Union[BuildProcess, RunProcess]] = {}
        self.last_id: int
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

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
        """Checks the status of the process with the given id by calling the `periodically_check_status`
        method of the process.

        This updates the process status in the database every 2 seconds.
        """
        await self.processes[id_].periodically_check_status()

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

    async def start(self, build_id: int, preset: Preset) -> int:
        """Starts a new run process.

        Increases the maximum existing id by 1 and assigns it to the new process.
        Starts the process and appends it to the processes list.

        Args:
            build_id (int): the build id to run
            preset (Preset): the preset to use among ("success", "failure", "loop")

        Returns:
            int: the id of the new started process
        """
        cmd_to_run = (
            f"chatsky.ui run_bot --build-id {build_id} "
            f"--preset {preset.end_status} "
            f"--project-dir {settings.work_directory}"
        )
        self.last_id = max([run["id"] for run in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id
        process = RunProcess(id_, build_id, preset.end_status)

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

    async def start(self, preset: Preset) -> int:
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

        if self.is_repeated_id(id_):
            raise ValueError(f"Build id '{id_}' already exists in the database")

        process = BuildProcess(id_, preset.end_status)
        if self.is_changed_graph(id_):
            cmd_to_run = (
                f"chatsky.ui build_bot " f"--preset {preset.end_status} " f"--project-dir {settings.work_directory}"
            )
            await process.start(cmd_to_run)
        self.processes[id_] = process

        return self.last_id

    async def check_status(self, id_, *args, **kwargs):
        """Checks the build "id_" process status by calling the `periodically_check_status`
        method of the process.

        This updates the process status in the database every 2 seconds.
        """
        await self.processes[id_].periodically_check_status()

    def is_repeated_id(self, id_: int) -> bool:
        bot_repo = get_repo(settings.custom_dir.parent)

        for tag in bot_repo.tags:
            if tag.name == str(id_):
                return True
        return False

    def is_changed_graph(self, id_: int) -> bool:
        chatsky_ui_repo = get_repo(settings.frontend_flows_path.parent)
        is_changed = save_frontend_graph_to_git(id_, chatsky_ui_repo)
        if is_changed:
            self.logger.info("Graph is changed. Gonna build")
            return True
        else:
            self.logger.info("Graph isn't changed. Ain't gonna build")
            return False

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
