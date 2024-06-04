from pathlib import Path
from typing import List, Type

from app.core.logger_config import get_logger
from app import BuildProcess, RunProcess, Process
from app.schemas.preset import Preset
from app.core.config import settings

logger = get_logger(__name__)


class ProcessManager:
    def __init__(self):
        self.processes = {}

    def get_last_id(self):
        """Get the process_id of the last started process"""
        return list(self.processes.keys())[-1]

    async def stop(self, pid):
        await self.processes[pid].stop()

    def check_status(self, pid):
        self.processes[pid].periodically_check_status()

    def get_status(self, pid):
        return self.processes[pid].check_status()

    def get_full_info(self, id_, path: Path, processclass: Type[Process]):
        if id_ in self.processes:
            process = self.processes[id_]
            return process.get_full_info()
        else:
            db_conf = settings.read_conf(path)
            process = processclass(id_)
            self.processes.update({id_: process})
            process_info = next((db_process for db_process in db_conf if db_process.id==process.id), None)
            process.set_full_info(process_info)
            return process_info


class RunManager(ProcessManager):
    def __init__(self):
        super().__init__()
        self.last_id = max([run["id"] for run in self.get_min_info()])

    def get_last_id(self):
        return self.last_id

    async def start(self, build_id: int, preset: Preset):
        cmd_to_run = f"dflowd run_bot {build_id} --preset {preset.end_status}"
        self.last_id += 1
        id_ = self.last_id
        process = RunProcess(id_, build_id, preset.end_status)
        await process.start(cmd_to_run)
        self.processes[id_] = process

    def get_min_info(self) -> List[dict]:
        runs_conf = settings.read_conf(settings.RUNS_PATH)
        minimum_params = ["id", "build_id", "preset_end_status", "status", "timestamp"]

        minimum_info = []
        for run in runs_conf:
            minimum_info.append({param: getattr(run, param) for param in minimum_params})

        return minimum_info

    def get_full_info(self, id_, path: Path = settings.RUNS_PATH, processclass: Type[Process] = RunProcess):
        return super().get_full_info(id_, path, processclass)


class BuildManager(ProcessManager):
    def __init__(self):
        super().__init__()
        self.last_id = max([build["id"] for build in self.get_min_info()])

    def get_last_id(self):
        return self.last_id

    async def start(self, preset: Preset):
        cmd_to_run = f"dflowd build_bot --preset {preset.end_status}"
        self.last_id += 1
        id_ = self.last_id
        process = BuildProcess(id_, preset.end_status)
        await process.start(cmd_to_run)
        self.processes[id_] = process

    def get_min_info(self) -> List[dict]:
        conf_path=settings.BUILDS_PATH
        builds_conf = settings.read_conf(conf_path)
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

    def get_full_info(self, id_, path: Path = settings.BUILDS_PATH, processclass: Type[Process] = BuildProcess):
        return super().get_full_info(id_, path, processclass)
