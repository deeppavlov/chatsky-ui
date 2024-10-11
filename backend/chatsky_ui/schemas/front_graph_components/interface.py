from pydantic import model_validator, RootModel
from typing import Any

from .base_component import BaseComponent


class Interface(BaseComponent, RootModel):
    @model_validator(mode="before")
    def validate_interface(cls, v):
        if not isinstance(v, dict):
            raise ValueError('interface must be a dictionary')
        if "telegram" in v:
            if not isinstance(v['telegram'], dict):
                raise ValueError('telegram must be a dictionary')
            if 'token' not in v['telegram'] or not isinstance(v['telegram']['token'], str):
                raise ValueError('telegram dictionary must contain a string token')
        elif "cli" in v:
            pass
        else:
            raise ValueError('interface must contain either telegram or cli')
        return v
