from pydantic import BaseModel

class Preset(BaseModel):
    wait_time: int
    end_status: str
