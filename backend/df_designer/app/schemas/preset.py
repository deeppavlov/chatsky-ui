from pydantic import BaseModel
from typing import Literal

class Preset(BaseModel):
    wait_time: float
    end_status: Literal["success", "failure", "loop"]
