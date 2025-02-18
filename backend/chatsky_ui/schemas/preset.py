from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class BasePreset(BaseModel):
    name: str
    end_status: Literal["success", "failure", "loop"]
    preset: str


class BuildPreset(BasePreset):
    messenger: Literal["telegram", "web"]


class RunPreset(BasePreset):
    build_name: str
    tg_bot_token: Optional[str] = Field(default="")

    @model_validator(mode="after")
    def validate_tg_bot_token(self):
        if self.tg_bot_token is not None:
            self.tg_bot_token = self.tg_bot_token.replace(" ", "_").upper()
        return self
