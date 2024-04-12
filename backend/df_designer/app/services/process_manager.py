from pathlib import Path
from typing import List, Type, Optional
from omegaconf import OmegaConf

from app.core.logger_config import get_logger
from app.services.process import BuildProcess, RunProcess
from app.schemas.preset import Preset
from app.core.config import settings
from app.db.base import read_conf, read_logs

logger = get_logger(__name__)


class ProcessManager:
    def __init__(self):
        self.processes = {}

    def get_last_id(self):
        """Get the process_id of the last started process"""
        return list(self.processes.keys())[-1]

    async def stop(self, id_):
        try:
            await self.processes[id_].stop()
        except (RuntimeError, ProcessLookupError) as exc:
            raise exc

    async def check_status(self, id_):
        await self.processes[id_].periodically_check_status()

    def get_status(self, id_):
        return self.processes[id_].check_status()

    async def get_process_info(self, id_: int, path: Path):
        db_conf = await read_conf(path)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return next((db_process for db_process in conf_dict if db_process["id"] == id_), None)

    async def get_full_info(self, offset: int, limit: int, path: Path) -> List[dict]:
        db_conf = await read_conf(path)
        conf_dict = OmegaConf.to_container(db_conf, resolve=True)
        return conf_dict[offset : offset + limit]

    async def fetch_process_logs(self, id_: int, offset: int, limit: int, path: Path):
        process_info = await self.get_process_info(id_, path)
        if process_info is None:
            logger.error("Id '%s' not found", id_)
            return None

        log_file = process_info["log_path"]
        try:
            logs = await read_logs(log_file)
        except FileNotFoundError:
            logger.error("Log file '%s' not found", log_file)
            return None

        if offset > len(logs):
            logger.info("Offset '%s' is out of bounds ('%s' logs found)", offset, len(logs))
            return None

        logger.info("Returning %s logs", len(logs))
        return logs[offset : offset + limit]


class RunManager(ProcessManager):
    def __init__(self):
        super().__init__()

    def get_last_id(self):
        return self.last_id

    async def start(self, build_id: int, preset: Preset):
        cmd_to_run = f"dflowd run_bot {build_id} --preset {preset.end_status}"
        self.last_id = max([run["id"] for run in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id
        process = RunProcess(id_, build_id, preset.end_status)
        await process.start(cmd_to_run)
        self.processes[id_] = process

    async def get_min_info(self) -> List[dict]:
        runs_conf = await read_conf(settings.runs_path)
        minimum_params = ["id", "build_id", "preset_end_status", "status", "timestamp"]

        minimum_info = []
        for run in runs_conf:
            minimum_info.append({param: getattr(run, param) for param in minimum_params})

        return minimum_info

    async def get_run_info(self, id_: int):
        return await super().get_process_info(id_, settings.runs_path)

    async def get_full_info(self, offset: int, limit: int, path: Path = settings.runs_path):
        return await super().get_full_info(offset, limit, path)

    async def fetch_run_logs(self, run_id: int, offset: int, limit: int):
        return await self.fetch_process_logs(run_id, offset, limit, settings.runs_path)


class BuildManager(ProcessManager):
    def __init__(self):
        super().__init__()

    def get_last_id(self):
        return self.last_id

    async def start(self, preset: Preset):
        cmd_to_run = f"dflowd build_bot --preset {preset.end_status}"
        self.last_id = max([build["id"] for build in await self.get_full_info(0, 10000)])
        self.last_id += 1
        id_ = self.last_id
        process = BuildProcess(id_, preset.end_status)
        cmd_to_run = f"dflowd build_bot {id_} --preset {preset.end_status}"
        await process.start(cmd_to_run)
        self.processes[id_] = process

    async def get_min_info(self) -> List[dict]:
        builds_conf = await read_conf(settings.builds_path)
        minimum_params = ["id", "preset_end_status", "status", "timestamp", "runs"]

        minimum_info = []
        for build in builds_conf:
            info = {}
            for param in minimum_params:
                if param != "runs":
                    info.update({param: getattr(build, param)})
                else:
                    info.update({"run_ids": [run.id for run in build.runs]})
            minimum_info.append(info)
        return minimum_info

    async def get_build_info(self, id_: int):
        return await super().get_process_info(id_, settings.builds_path)

    async def get_full_info(self, offset: int, limit: int, path: Path = settings.builds_path):
        return await super().get_full_info(offset, limit, path)

    async def fetch_build_logs(self, build_id: int, offset: int, limit: int):
        return await self.fetch_process_logs(build_id, offset, limit, settings.builds_path)
