from asyncio import Lock
from pathlib import Path
from typing import List

import aiofiles
from omegaconf import OmegaConf
from omegaconf.dictconfig import DictConfig
from omegaconf.listconfig import ListConfig

file_lock = Lock()


async def read_conf(path: Path) -> DictConfig | ListConfig:
    async with file_lock:
        async with aiofiles.open(path, "r", encoding="UTF-8") as file:
            data = await file.read()
    omega_data = OmegaConf.create(data)  # read from a YAML string
    return omega_data


async def write_conf(data: DictConfig | ListConfig | dict | list, path: Path) -> None:
    yaml_conf = OmegaConf.to_yaml(data)
    async with file_lock:
        async with aiofiles.open(path, "w", encoding="UTF-8") as file:  # TODO: change to "a" for append
            await file.write(yaml_conf)


async def read_logs(log_file: Path) -> List[str]:
    logs = []
    if not log_file.exists():
        raise FileNotFoundError(f"Log file '{log_file}' not found")
    async with aiofiles.open(log_file, "r", encoding="UTF-8") as file:
        logs = [line async for line in file]
    return logs
