import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from pydantic import Field, model_validator

from chatsky_ui.core.config import settings

from .base_component import BaseComponent

load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)


class Interface(BaseComponent):
    model_config = {"extra": "forbid"}

    telegram: Optional[Dict[str, Any]] = Field(default=None)
    http: Optional[Dict[str, Any]] = Field(default=None)

    @model_validator(mode="after")
    def check_one_not_none(cls, values):
        non_none_values = [x for x in [values.telegram, values.http] if x is not None]
        if len(non_none_values) != 1:
            raise ValueError('Exactly one of "telegram", or "http" must be provided.')
        return values

    @model_validator(mode="after")
    def check_telegram_token(cls, values):
        tg_bot_token = os.getenv("TG_BOT_TOKEN")
        if values.telegram is not None and not tg_bot_token:
            raise ValueError("Telegram token must be provided.")
        return values
