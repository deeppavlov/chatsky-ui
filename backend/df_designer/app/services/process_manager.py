"""
Process manager
----------------

Process managers are used to manage run and build processes. They are responsible for
starting, stopping, updating, and checking status of processes. Processes themselves
are stored in the `processes` dictionary of process managers.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional

from omegaconf import OmegaConf

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, read_logs
from app.schemas.preset import Preset
from app.schemas.process_status import Status
from app.services.process import BuildProcess, RunProcess

logger = get_logger(__name__)


class ProcessManager:
    """Base for build and run process managers."""

    def __init__(self):
        self.processes: Dict[int, BuildProcess | RunProcess] = {}
        self.last_id: int

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
            logger.error("Process with id '%s' not found in recent running processes", id_)
            raise ProcessLookupError
        try:
            await self.processes[id_].stop()
        except (RuntimeError, ProcessLookupError):
            raise

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
            logger.error("Id '%s' not found", id_)
            return None

        log_file = Path(process_info["log_path"])
        try:
            logs = await read_logs(log_file)
            logs = [log for log in logs if log.strip()]
        except FileNotFoundError:
            logger.error("Log file '%s' not found", log_file)
            return None

        if offset > len(logs):
            logger.info("Offset '%s' is out of bounds ('%s' logs found)", offset, len(logs))
            return None  # TODO: raise error!

        logger.info("Returning %s logs", len(logs))
        return logs[offset : offset + limit]


class RunManager(ProcessManager):
    """Process manager for running a DFF pipeline."""

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
        cmd_to_run = f"dflowd run_bot {build_id} --preset {preset.end_status}"
        self.last_id = max([run["id"] for run in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id
        process = RunProcess(id_, build_id, preset.end_status)
        await process.start(cmd_to_run)
        process.logger.debug("Started process. status: '%s'", process.process.returncode)
        self.processes[id_] = process

        return self.last_id

    async def get_run_info(self, id_: int) -> Optional[Dict[str, Any]]:
        """Returns metadata of  a specific run process identified by its unique ID."""
        return await super().get_process_info(id_, settings.runs_path)

    async def get_full_info(self, offset: int, limit: int, path: Path = settings.runs_path) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of run processes, starting from the ``offset``th process."""
        return await super().get_full_info(offset, limit, path)

    async def fetch_run_logs(self, run_id: int, offset: int, limit: int) -> Optional[List[str]]:
        """Returns the logs of one run according to its id.

        Number of loglines returned is based on `offset` as the start line and limited by `limit` lines.
        """
        return await self.fetch_process_logs(run_id, offset, limit, settings.runs_path)


class BuildManager(ProcessManager):
    """Process manager for converting a frontned graph to a DFF script."""

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
        process = BuildProcess(id_, preset.end_status)
        cmd_to_run = f"dflowd build_bot {id_} --preset {preset.end_status}"
        await process.start(cmd_to_run)
        self.processes[id_] = process

        return self.last_id

    async def check_status(self, id_, index, *args, **kwargs):
        """Checks the build "id_" process status by calling the `periodically_check_status`
        method of the process.

        This updates the process status in the database every 2 seconds.
        The index is refreshed after the build is done/failed.
        """
        await self.processes[id_].periodically_check_status()
        await index.load()

    async def get_build_info(self, id_: int, run_manager: RunManager) -> Optional[Dict[str, Any]]:
        """Returns metadata of a specific build process identified by its unique ID.

        Args:
            ``id_`` (int): the id of the build
            ``run_manager`` (RunManager): the run manager to use for getting all runs of this build
        """
        builds_info = await self.get_full_info_with_runs_info(run_manager, offset=0, limit=10**5)
        return next((build for build in builds_info if build["id"] == id_), None)

    async def get_full_info(self, offset: int, limit: int, path: Path = settings.builds_path) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset`` process."""
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
