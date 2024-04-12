from asyncio import Lock
import aiofiles
from pathlib import Path
from omegaconf import OmegaConf
from typing import Union

file_lock = Lock()


async def read_conf(path: Path):
    async with file_lock:
        async with aiofiles.open(path, "r", encoding="UTF-8") as file:
            data = await file.read()
    omega_data = OmegaConf.create(data)  # read from a YAML string
    return omega_data


async def write_conf(data: Union[list, dict], path: Path):
    yaml_conf = OmegaConf.to_yaml(data)
    async with file_lock:
        async with aiofiles.open(path, "w", encoding="UTF-8") as file:  # TODO: change to "a" for append
            await file.write(yaml_conf)


async def read_logs(log_file: Path):
    async with aiofiles.open(log_file, "r", encoding="UTF-8") as file:
        logs = [line async for line in file if line.strip()]
    return logs
