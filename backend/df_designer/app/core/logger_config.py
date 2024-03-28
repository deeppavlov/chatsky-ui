from datetime import datetime
import logging
from pathlib import Path
import os

from app.core.config import settings

LOG_LEVELS: dict[str, int] = {
    "critical": logging.CRITICAL,
    "error": logging.ERROR,
    "warning": logging.WARNING,
    "info": logging.INFO,
    "debug": logging.DEBUG,
}

def setup_logging(log_type: str, log_name: str) -> Path:
    # Ensure log_type is either 'builds' or 'runs'
    if log_type not in ['builds', 'runs']:
        raise ValueError("log_type must be 'builds' or 'runs'")

    today_date = datetime.now().strftime("%Y%m%d")
    log_directory = settings.DIR_LOGS / log_type / today_date

    os.makedirs(log_directory, exist_ok=True)

    log_file = log_directory / f"{log_name}.log"
    if not os.path.exists(log_file):
        open(log_file, 'w', encoding="UTF-8").close()
    return log_file

def get_logger(name, file_handler_path: Path = settings.DIR_LOGS/ "logs.log"):
    logger = logging.getLogger(name)
    logger.propagate = False
    logger.setLevel(LOG_LEVELS[settings.LOG_LEVEL])

    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler(file_handler_path)
    c_handler.setLevel(LOG_LEVELS[settings.LOG_LEVEL])
    f_handler.setLevel(LOG_LEVELS[settings.LOG_LEVEL])

    c_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    f_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)

    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger
