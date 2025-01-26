from typing import Literal

from pydantic import BaseModel


class BasePreset(BaseModel):
    name: str
    end_status: Literal["success", "failure", "loop"]
    preset: str


class BuildPreset(BasePreset):
    messanger: Literal["telegram", "web"]


class RunPreset(BasePreset):
    build_name: str
