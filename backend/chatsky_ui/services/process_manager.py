# flake8: noqa: W503
"""
Process manager
----------------

Process managers are used to manage run and build processes. They are responsible for
starting, stopping, updating, and checking status of processes. Processes themselves
are stored in the `processes` dictionary of process managers.
"""
import asyncio
import os
import socket
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from dotenv import load_dotenv
from omegaconf import OmegaConf

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, read_logs, write_conf
from chatsky_ui.schemas.preset import BuildPreset, RunPreset
from chatsky_ui.schemas.process_status import Status
from chatsky_ui.services.json_converter.consts import UNIQUE_BUILD_TOKEN
from chatsky_ui.services.process import BuildProcess, RunProcess
from chatsky_ui.utils.repo_manager import RepoManager


class ProcessManager(ABC):
    """Base for build and run process managers."""

    _db_lock = asyncio.Lock()

    def __init__(self):
        self.processes: Dict[int, Union[BuildProcess, RunProcess]] = {}
        self.last_id: int
        self._logger = None
        self._bot_repo_manager = None
        self._graph_repo_manager = None

    @staticmethod
    def _is_available_port(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("localhost", port)) != 0

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
        await self.update_db_info()

    @abstractmethod
    async def update_db_info(self):
        raise NotImplementedError

    async def check_status(self, id_: int, *args, **kwargs) -> None:
        """Checks the status of the process with the given id by periodically checking status`
        of the process.

        This updates the process status in the database every 2 seconds.
        """
        process = self.processes[id_]
        while not process.to_be_terminated:
            await self.update_db_info()  # check status and update db
            process.logger.info("Status of process '%s': %s", process.id, process.status)
            if process.status in [
                Status.NULL,
                Status.STOPPED,
                Status.COMPLETED,
                Status.FAILED,
                Status.FAILED_WITH_UNEXPECTED_CODE,
            ]:
                await self.update_db_info()
                break
            await asyncio.sleep(2)  # TODO: ?sleep time shouldn't be constant

    async def get_status(self, id_: int) -> Status:
        """Checks the status of the process with the given id by calling the `check_status` method of the process."""
        return await self.processes[id_].check_status()

    async def get_process_info(self, id_: int, path: Path, path_lock) -> Optional[Dict[str, Any]]:
        """Returns metadata of a specific process identified by its unique ID."""
        db_conf = await read_conf(path, path_lock)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return next((db_process for db_process in conf_dict if db_process["id"] == id_), None)  # type: ignore

    async def get_full_info(self, offset: int, limit: int, path: Path, path_lock) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset``th process."""

        db_conf = await read_conf(path, path_lock)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return conf_dict[offset : offset + limit]  # type: ignore

    async def fetch_process_logs(self, id_: int, offset: int, limit: int, path: Path, path_lock) -> Optional[List[str]]:
        """Returns the logs of one process according to its id. If the process is not found, returns None."""
        process_info = await self.get_process_info(id_, path, path_lock)
        if process_info is None:
            self.logger.error("Id '%s' not found", id_)
            return None  # TODO: raise error and handle it!

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

    @staticmethod
    def add_new_conf(conf: list, params: dict) -> list:  # TODO: rename conf everywhere to metadata/meta
        for element in conf:
            if element.id == params["id"]:  # type: ignore
                for key, value in params.items():
                    setattr(element, key, value)
                break
        else:
            conf.append(params)

        return conf


class RunManager(ProcessManager):
    """Process manager for running a Chatsky pipeline."""

    def __init__(self):
        super().__init__()
        self.last_run_time = datetime.now().replace(year=datetime.now().year - 1)

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

        async def _get_new_id():
            return max([run["id"] for run in await self.get_full_info(0, 10000)]) + 1

        async def _get_build_info(build_id):
            build_info = await self.get_process_info(build_id, settings.builds_path, settings.builds_path_lock) or {}
            if not build_info:
                raise ValueError(f"Build id '{build_id}' not found in the database")
            port = build_info.get("port")
            messenger = build_info["preset"]["messenger"]
            self.logger.debug("Attached build port '%s' for run process '%s'", port, self.last_id)
            return port, messenger

        async def _check_available_tg_token(token_name):
            for run in await self.get_full_info(0, 10000):
                if token_name and token_name == run["preset"]["tg_bot_token"] and run["status"] in ["running", "alive"]:
                    raise ValueError(
                        f"Bot with token name '{token_name}' is already in use "
                        f"by another run process with id: '{run['id']}'"
                    )

        def _assign_token_to_key_used_by_build(token_name, unique_build_token):
            full_token_name = "_".join(["TG", token_name])
            self.logger.info("Assigning token '%s' to key '%s'", full_token_name, unique_build_token)
            token_value = os.getenv(full_token_name)
            if token_value is None:
                raise ValueError(f"Token name '{token_name}' isn't set. Please call endpoint 'flows/tg_tokens'.")
            settings.add_env_vars({unique_build_token: token_value})

        if (datetime.now() - self.last_run_time).seconds < 13 and [
            process for process in self.processes.values() if process.status == Status.RUNNING
        ]:
            raise RuntimeError("Another process is still using the build.yaml file. Can't checkout.")

        self.last_id = await _get_new_id()
        build_port, messenger = await _get_build_info(build_id)

        if build_port is not None and not RunManager._is_available_port(build_port):
            raise ConnectionError(f"Port conflict: port '{build_port}' is already in use")

        if messenger == "telegram":
            await _check_available_tg_token(preset.tg_bot_token)
            load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)
            _assign_token_to_key_used_by_build(preset.tg_bot_token, UNIQUE_BUILD_TOKEN.format(build_id=build_id))

        self.bot_repo_manager.checkout_tag(build_id, "scripts/build.yaml")
        cmd_to_run = f"chatsky.ui run_bot " f"--preset {preset.end_status} " f"--project-dir {settings.work_directory}"

        process = RunProcess(self.last_id, build_id, messenger, build_port, preset)

        await process.start(cmd_to_run, env=os.environ.copy())
        process.logger.debug("Started process. status: '%s'", process.process.returncode)
        self.last_run_time = datetime.now()

        self.processes[self.last_id] = process
        await self.update_db_info()

        return self.last_id

    async def get_run_info(self, id_: int) -> Optional[Dict[str, Any]]:
        """Returns metadata of  a specific run process identified by its unique ID."""
        return await super().get_process_info(id_, settings.runs_path, settings.runs_path_lock)

    async def get_full_info(self, offset: int, limit: int, path: Path = None) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of run processes, starting from the ``offset``th process."""
        path = settings.runs_path
        return await super().get_full_info(offset, limit, path, settings.runs_path_lock)

    async def fetch_run_logs(self, run_id: int, offset: int, limit: int) -> Optional[List[str]]:
        """Returns the logs of one run according to its id.

        Number of loglines returned is based on `offset` as the start line and limited by `limit` lines.
        """
        return await self.fetch_process_logs(run_id, offset, limit, settings.runs_path, settings.runs_path_lock)

    def get_port(self, run_id: int) -> Optional[int]:
        return self.processes[run_id].port

    async def update_db_info(self) -> None:
        # save current run info into runs_path
        async with ProcessManager._db_lock:
            self.logger.debug("Updating db run info")
            runs_conf = await read_conf(settings.runs_path, settings.runs_path_lock)
            builds_conf = await read_conf(settings.builds_path, settings.builds_path_lock)
            for process in self.processes.values():
                run_params = (
                    await process.get_full_info()
                )  # TODO: Try to use the process object attributes instead of having it as dict using get_full_info
                runs_conf = RunManager.add_new_conf(runs_conf, run_params)  # type: ignore

                # save current run id into the correspoinding build in builds_path
                for build in builds_conf:
                    if build.id == run_params["build_id"]:  # type: ignore
                        if run_params["id"] not in build.run_ids:  # type: ignore
                            build.run_ids.append(run_params["id"])  # type: ignore
                            break
            await write_conf(runs_conf, settings.runs_path, settings.runs_path_lock)
            await write_conf(builds_conf, settings.builds_path, settings.builds_path_lock)


class BuildManager(ProcessManager):
    """Process manager for converting a frontned graph to a Chatsky script."""

    def __init__(self):
        super().__init__()
        self.last_build_time = datetime.now().replace(year=datetime.now().year - 1)

    async def _get_available_port(self) -> int:
        async def _get_busy_ports():
            builds_metadata = await self.get_full_info(0, 10000)
            return [build["port"] for build in builds_metadata if build["port"] is not None]

        busy_ports = await _get_busy_ports()
        if busy_ports:
            port = max(busy_ports) + 1
        else:
            port = 8001

        while not BuildManager._is_available_port(port):
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
        if [process for process in self.processes.values() if process.status == Status.RUNNING] and (
            datetime.now() - self.last_build_time
        ).seconds < 5:
            raise RuntimeError("Another process is still using the build.yaml file. Can't commit changes.")

        self.last_id = max([build["id"] for build in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id

        if self.bot_repo_manager.is_repeated_tag(id_):
            raise ValueError(f"Build id '{id_}' already exists in the database")

        if preset.messenger == "web":
            port = await self._get_available_port()
            self.logger.debug("Available port: %s", port)
        else:
            port = None
        process = BuildProcess(id_, port, preset)
        cmd_to_run = (
            f"chatsky.ui build_bot {id_} "
            f"--preset {preset.end_status} "
            f"--project-dir {settings.work_directory}"
            f" --messenger {preset.messenger}"
        )
        if port is not None:
            cmd_to_run += f" --chatsky-port {port}"

        await process.start(cmd_to_run)
        self.last_build_time = datetime.now()
        self.processes[id_] = process

        return id_

    async def check_status(self, id_: int, *args, **kwargs) -> None:
        """Checks the status of the process with the given id by periodically checking status`
        of the process.

        This updates the process status in the database every 2 seconds.
        """
        process = self.processes[id_]
        while not process.to_be_terminated:
            await self.update_db_info()  # check status and update db
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
                await self.update_db_info()
                break

    async def get_full_info(self, offset: int, limit: int, path: Path = None) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset`` process."""
        path = settings.builds_path
        return await super().get_full_info(offset, limit, path, settings.builds_path_lock)

    async def fetch_build_logs(self, build_id: int, offset: int, limit: int) -> Optional[List[str]]:
        """Returns the logs of one build according to its id.

        Number of loglines returned is based on `offset` as the start line and limited by `limit` lines.
        """
        return await self.fetch_process_logs(build_id, offset, limit, settings.builds_path, settings.builds_path_lock)

    async def update_db_info(self) -> None:
        """Saves current build info into builds_path"""
        async with ProcessManager._db_lock:
            builds_conf = await read_conf(settings.builds_path, settings.builds_path_lock)
            for process in self.processes.values():
                build_params = await process.get_full_info()
                builds_conf = BuildManager.add_new_conf(builds_conf, build_params)  # type: ignore

            await write_conf(builds_conf, settings.builds_path, settings.builds_path_lock)
