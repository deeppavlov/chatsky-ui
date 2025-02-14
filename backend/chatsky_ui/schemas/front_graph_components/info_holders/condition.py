from typing import List, Optional, Dict, Union
from pydantic import Field, model_validator

from ..base_component import BaseComponent
from chatsky.conditions import All, Any, ExactMatch, Regexp, HasText, Not

class Condition(BaseComponent):
    name: str


class CustomCondition(Condition):
    code: str


class SlotCondition(Condition):
    slot_id: str  # not the condition id


class ExactMatchCondition(ExactMatch):
    match: str


class IncludeTextCondition(HasText):
    text: str


class NotCondition(Not):
    condition: dict


class RegexpCondition(Regexp):
    pattern: str
    flags: Dict[str, str] = Field(default_factory=dict, description="Flags for the regex pattern")

    @model_validator(mode="after")
    def validate_flags(self):
        allowed_keys = {'ignoreCase'}
        for key in self.flags.keys():
            if key not in allowed_keys:
                raise ValueError(f"Invalid key '{key}' in flags. Allowed keys are {allowed_keys}")
        return self


class AllOfCondition(BaseComponent):
    conditions: List[dict]


class AnyOfCondition(BaseComponent):
    conditions: List[dict]


class ChatskyCondition(Condition):
    condition: Union[ExactMatchCondition, IncludeTextCondition, NotCondition, RegexpCondition, AllOfCondition, AnyOfCondition]
