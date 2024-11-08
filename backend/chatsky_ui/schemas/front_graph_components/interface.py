from pydantic import Field, model_validator
from typing import Any

from .base_component import BaseComponent
from typing import Optional, Dict
from dotenv import load_dotenv
import os

from chatsky_ui.core.config import settings

class Interface(BaseComponent):
    telegram: Optional[Dict[str, Any]] = Field(default=None)
    cli: Optional[Dict[str, Any]] = Field(default=None)

    @model_validator(mode='after')
    def check_one_not_none(cls, values):
        telegram, cli = values.telegram, values.cli
        if (telegram is None) == (cli is None):
            raise ValueError('Exactly one of "telegram" or "cli" must be provided.')
        return values
    
    @model_validator(mode='after')
    def check_telegram_token(cls, values):
        load_dotenv(os.path.join(settings.work_directory, '.env'))
        tg_bot_token = os.getenv('TG_BOT_TOKEN')
        if values.telegram is not None and not tg_bot_token:
            raise ValueError('Telegram token must be provided.')
        return values
