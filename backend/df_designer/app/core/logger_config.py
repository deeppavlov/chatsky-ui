import logging

from app.core.config import settings

LOG_LEVELS: dict[str, int] = {
    "critical": logging.CRITICAL,
    "error": logging.ERROR,
    "warning": logging.WARNING,
    "info": logging.INFO,
    "debug": logging.DEBUG,
}


def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(LOG_LEVELS[settings.LOG_LEVEL])

    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler(settings.DIR_LOGS)
    c_handler.setLevel(LOG_LEVELS[settings.LOG_LEVEL])
    f_handler.setLevel(LOG_LEVELS[settings.LOG_LEVEL])

    c_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    f_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)

    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger
