import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from pydantic import Field, model_validator

from chatsky_ui.core.config import settings

from .base_component import BaseComponent

load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)


class Messenger(BaseComponent):
    model_config = {"extra": "forbid"}

    telegram: Optional[Dict[str, Any]] = Field(default=None)
    tg_token_name: Optional[str] = Field(default=None)
    web: Optional[Dict[str, Any]] = Field(default=None)
    chatsky_port: Optional[int] = Field(default=None)

    @model_validator(mode="after")
    def check_one_not_none(self):
        non_none_values = [x for x in [self.telegram, self.web] if x is not None]
        if len(non_none_values) != 1:
            raise ValueError('Exactly one of "telegram", or "web" must be provided.')
        return self

    @model_validator(mode="after")
    def check_chatsky_port(self):
        if self.web is None and self.chatsky_port is not None:
            raise ValueError("The 'chatsky_port' must not be provided when not using 'web' messenger.")
        elif self.web is not None and self.chatsky_port is None:
            raise ValueError("The 'chatsky_port' must be provided when using 'web' messenger.")
        return self

    @model_validator(mode="after")
    def check_token_name(self):
        if self.telegram is not None and (self.tg_token_name is None or self.tg_token_name == ""):
            raise ValueError("The 'tg_token_name' must be provided when using 'telegram' messenger.")
        return self

    # TODO: Add a model validator to check if the token name is in the .env file
