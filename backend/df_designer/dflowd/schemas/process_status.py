from enum import Enum


class Status(Enum):
    NULL = "null"
    STOPPED = "stopped"
    COMPLETED = "completed"
    FAILED = "failed"
    RUNNING = "running"
    ALIVE = "alive"
    FAILED_WITH_UNEXPECTED_CODE = "failed with unexpected returncode"
