from pydantic import Field, model_validator
from typing import Any

from .base_component import BaseComponent
from typing import Optional, Dict

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
        if values.telegram is not None and 'token' not in values.telegram:
            raise ValueError('Telegram token must be provided.')
        return values
