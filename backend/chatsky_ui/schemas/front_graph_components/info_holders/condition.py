# condition.py
"""
Pydantic models for various conditions used in chatsky.

These models define the structure of conditions and ensure the data is
validated correctly.
"""

from typing import Dict, List, Union

from chatsky.conditions import ExactMatch, HasText, Not, Regexp
from pydantic import Field, model_validator

from ..base_component import BaseComponent


class Condition(BaseComponent):
    """Base condition model."""

    name: str


class CustomCondition(Condition):
    """A condition defined by custom code."""

    code: str


class SlotCondition(Condition):
    """A condition associated with a slot identifier."""

    slot_id: str  # not the condition id


# --------------------------------------------------------------
# The following classes are used to define the structure of conditions in ChatskyCondition
# --------------------------------------------------------------


class ExactMatchCondition(ExactMatch):
    """Condition that matches exact text."""

    match: str


class IncludeTextCondition(HasText):
    """Condition that checks for the inclusion of text."""

    text: str


class NotCondition(Not):
    """Condition that negates another condition."""

    condition: dict


class RegexpCondition(Regexp):
    """Condition based on regular expression matching."""

    pattern: str
    flags: Dict[str, bool] = Field(default_factory=dict, description="Flags for the regex pattern")

    @model_validator(mode="after")
    def validate_flags(self) -> "RegexpCondition":
        allowed_keys = {"caseSensitive"}
        invalid_keys = set(self.flags) - allowed_keys
        if invalid_keys:
            raise ValueError(f"Invalid key(s) {invalid_keys} in flags. Allowed keys are {allowed_keys}")
        return self


class AllOfCondition(BaseComponent):
    """Condition that requires all sub-conditions to be met."""

    conditions: List[dict]


class AnyOfCondition(BaseComponent):
    """Condition that requires any sub-condition to be met."""

    conditions: List[dict]


# --------------------------------------------------------------


class ChatskyCondition(Condition):
    """Chatsky condition encapsulating various condition types."""

    condition: Union[
        ExactMatchCondition, IncludeTextCondition, NotCondition, RegexpCondition, AllOfCondition, AnyOfCondition
    ]
