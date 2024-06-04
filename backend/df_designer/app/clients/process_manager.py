from typing import List
from random import randint

from app.core.logger_config import get_logger
from app import BuildProcess, RunProcess

logger = get_logger(__name__)


def _get_preset_end_status(command):
    if "--preset" in (words:=command.split()):
        return words[words.index("--preset")+1]
    return "success" #default


class ProcessManager:
    def __init__(self):
        self.processes = {}

    async def start(self, process_type: str, cmd_to_run: str):
        id_ = randint(1, 10000) #TODO: change it to incremental counter
        if process_type == "build":
            process = BuildProcess(id_, _get_preset_end_status(cmd_to_run))
        elif process_type == "run":
            process = RunProcess(id_, _get_preset_end_status(cmd_to_run))
        else: raise ValueError("process_type should be one of [build, run]")
        await process.start(cmd_to_run)
        self.processes[id_] = process

    def get_last_id(self):
        """Get the process_id of the last started process"""
        return list(self.processes.keys())[-1]

    def stop(self, pid):
        self.processes[pid].stop()
        self.processes.pop(pid)

    def check_status(self, pid):
        return self.processes[pid].check_status()

    def get_min_info(self) -> List[dict]:
        build_min_info = ["build_id", "build_preset_name", "status", "timestamp"]
        run_min_info = ["run_id", "run_preset_name", "status", "timestamp"]
        if isinstance(next(iter(self.processes.values())), RunProcess): #TODO: really doesn't sound clean!
            min_info = run_min_info
        elif isinstance(next(iter(self.processes.values())), BuildProcess):
            min_info = build_min_info

        min_processes_info = []
        for _, process in self.processes.items():
            process_info = process.get_full_info()
            min_processes_info.append({k:v for k,v in process_info.items() if k in min_info})
        return min_processes_info

    def get_full_info(self, id_: int) -> dict:
        if id_ in self.processes:
            return self.processes[id_].get_full_info()
        return {}
