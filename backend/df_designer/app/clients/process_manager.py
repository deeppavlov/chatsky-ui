from typing import List
from random import randint

from app.core.logger_config import get_logger
from app import BuildProcess, RunProcess
from app.schemas.preset import Preset

logger = get_logger(__name__)


class ProcessManager:
    def __init__(self):
        self.processes = {}

    def get_last_id(self):
        """Get the process_id of the last started process"""
        return list(self.processes.keys())[-1]

    def stop(self, pid):
        self.processes[pid].stop()
        self.processes.pop(pid)

    def check_status(self, pid):
        return self.processes[pid].check_status()

    def get_full_info(self, id_: int) -> dict:
        if id_ in self.processes:
            return self.processes[id_].get_full_info()
        return {}


class RunManager(ProcessManager):
    def __init__(self):
        super().__init__()
    
    async def start(self, build_id: int, preset: Preset):
        cmd_to_run = f"dflowd run_bot {build_id} --preset {preset.end_status}"
        id_ = randint(1, 10000) #TODO: change it to incremental counter
        process = RunProcess(id_, preset.end_status)
        await process.start(cmd_to_run)
        self.processes[id_] = process

    def get_min_info(self) -> List[dict]:
        minimum_params = ["run_id", "run_preset_name", "status", "timestamp"]

        min_processes_info = []
        for _, process in self.processes.items():
            process_info = process.get_full_info()
            min_processes_info.append({param:v for param,v in process_info.items() if param in minimum_params})
        return min_processes_info


class BuildManager(ProcessManager):
    def __init__(self):
        super().__init__()

    async def start(self, preset: Preset):
        cmd_to_run = f"dflowd build_bot --preset {preset.end_status}"
        id_ = randint(1, 10000) #TODO: change it to incremental counter
        process = BuildProcess(id_, preset.end_status)
        await process.start(cmd_to_run)
        self.processes[id_] = process

    def get_min_info(self) -> List[dict]:
        minimum_params = ["build_id", "build_preset_name", "status", "timestamp"]

        min_processes_info = []
        for _, process in self.processes.items():
            process_info = process.get_full_info()
            min_processes_info.append({param:v for param,v in process_info.items() if param in minimum_params})
        return min_processes_info
