from typing import Literal, Optional

from pydantic import BaseModel, Field


class BasePreset(BaseModel):
    name: str
    end_status: Literal["success", "failure", "loop"]
    preset: str


class BuildPreset(BasePreset):
    messenger: Literal["telegram", "web"]


class RunPreset(BasePreset):
    build_name: str
    tg_bot_token: Optional[str] = Field(default="")
