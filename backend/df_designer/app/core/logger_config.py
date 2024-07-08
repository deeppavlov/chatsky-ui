import logging
from datetime import datetime
from pathlib import Path
from typing import Literal, Optional

from app.core.config import settings

LOG_LEVELS: dict[str, int] = {
    "critical": logging.CRITICAL,
    "error": logging.ERROR,
    "warning": logging.WARNING,
    "info": logging.INFO,
    "debug": logging.DEBUG,
}


def setup_logging(log_type: Literal["builds", "runs"], id_: int, timestamp: datetime) -> Path:
    # Ensure log_type is either 'builds' or 'runs'
    if log_type not in ["builds", "runs"]:
        raise ValueError("log_type must be 'builds' or 'runs'")

    # Get today's date separated with '_' using the timestamp
    log_name = "_".join([str(id_), timestamp.strftime("%H:%M:%S")])
    today_date = timestamp.strftime("%Y%m%d")

    log_directory = settings.dir_logs / log_type / today_date

    log_directory.mkdir(parents=True, exist_ok=True)

    log_file = log_directory / f"{log_name}.log"
    log_file.touch(exist_ok=True)
    return log_file


def get_logger(name, file_handler_path: Optional[Path] = None):
    if file_handler_path is None:
        file_handler_path = settings.dir_logs / "logs.log"
    if not file_handler_path.parent.exists():
        raise FileNotFoundError(f"File {file_handler_path} doesn't exist")
    file_handler_path.touch(exist_ok=True)

    logger = logging.getLogger(name)
    logger.propagate = False
    logger.setLevel(LOG_LEVELS[settings.log_level])

    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler(file_handler_path)
    c_handler.setLevel(LOG_LEVELS[settings.log_level])
    f_handler.setLevel(LOG_LEVELS[settings.log_level])

    c_format = logging.Formatter("%(name)s - %(levelname)s - %(message)s")
    f_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)

    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger
