from pathlib import Path
from typing import List, Union

import aiofiles
from omegaconf import OmegaConf
from omegaconf.dictconfig import DictConfig
from omegaconf.listconfig import ListConfig


async def read_conf(path: Path, lock) -> Union[DictConfig, ListConfig]:
    """
    Reads a configuration file asynchronously and returns its contents as an OmegaConf object.
    Args:
        path (Path): The path to the configuration file.
        lock: An asynchronous lock to ensure inter-process-safe file access.
    Returns:
        Union[DictConfig, ListConfig]: The configuration data read from the file, parsed into an OmegaConf object.
    """

    async with lock:
        async with aiofiles.open(path, "r", encoding="UTF-8") as file:
            data = await file.read()
    omega_data = OmegaConf.create(data)  # read from a YAML string
    return omega_data


async def write_conf(data: Union[DictConfig, ListConfig, dict, list], path: Path, lock) -> None:
    """Writes the given configuration data to a YAML file asynchronously.

    Args:
        data (Union[DictConfig, ListConfig, dict, list]): The configuration data to write.
        path (Path): The file path where the configuration data will be written.
        lock: An asynchronous lock to ensure that the file writing operation is inter-process-safe.

    Returns:
        None
    """
    yaml_conf = OmegaConf.to_yaml(data)
    async with lock:
        async with aiofiles.open(path, "w", encoding="UTF-8") as file:  # TODO: change to "a" for append
            await file.write(yaml_conf)


async def read_logs(log_file: Path) -> List[str]:
    logs = []
    if not log_file.exists():
        raise FileNotFoundError(f"Log file '{log_file}' not found")
    async with aiofiles.open(log_file, "r", encoding="UTF-8") as file:
        logs = [line async for line in file]
    return logs
