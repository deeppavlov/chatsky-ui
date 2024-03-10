import json
import os
from datetime import datetime
import logging
from pathlib import Path
from typing import Any

import aiofiles
from pydantic import Json

from df_designer.settings import app


async def save_data(path: Path, data: dict[str, str]):
    """Save the json config."""
    async with aiofiles.open(path, "w", encoding="utf-8") as file:
        await file.write(json.dumps(data))


async def get_data(path: Path) -> Json[Any]:
    """Get the json config."""
    if os.path.exists(path):
        async with aiofiles.open(path, "r", encoding="utf-8") as file:
            return json.loads(await file.read())
    else:
        return {}


def log_file_name() -> Path:
    """Create title a log."""
    file_log_name = datetime.now().strftime("%Y_%m_%d_%H_%M_%s") + ".txt"
    return Path(app.dir_logs, file_log_name)


def create_directory_to_log():
    """Create directory to log files."""
    if not Path(app.dir_logs).exists():
        Path(app.dir_logs).mkdir()


def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler('logs.log')
    c_handler.setLevel(logging.DEBUG)
    f_handler.setLevel(logging.DEBUG)

    c_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    f_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)

    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger
