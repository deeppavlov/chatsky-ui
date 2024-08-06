from typing import Literal

from pydantic import BaseModel


class Preset(BaseModel):
    wait_time: float
    end_status: Literal["success", "failure", "loop"]
