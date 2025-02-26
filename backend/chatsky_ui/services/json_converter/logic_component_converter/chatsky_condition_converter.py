# chatsky_condition_converter.py
import re
from abc import ABC, abstractmethod
from typing import Any

from ....schemas.front_graph_components.info_holders.condition import (
    AllOfCondition,
    AnyOfCondition,
    ChatskyCondition,
    ExactMatchCondition,
    IncludeTextCondition,
    NotCondition,
    RegexpCondition,
)
from .condition_converter import BadConditionException, ConditionConverter


def get_nested(data: dict, keys: list[str]) -> Any:
    """
    Helper function to safely retrieve nested values from a dictionary.

    Raises:
        BadConditionException: If any key is missing in the data.
    """
    try:
        for key in keys:
            data = data[key]
        return data
    except KeyError as e:
        raise BadConditionException(f"Missing key {e} in condition data") from e


class BaseChatskyConditionConverter(ConditionConverter, ABC):
    def __init__(self, condition_data: dict) -> None:
        self.condition: ChatskyCondition

    @abstractmethod
    def _convert(self) -> dict:
        """
        Convert the condition into its target representation.

        Must be implemented by all subclasses.
        """
        pass

    def __call__(self, *args, **kwargs) -> dict:
        return self._convert()

    def get_pre_transitions(self) -> dict:
        """Default implementation returning an empty dict."""
        return {}


class ExactMatchConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        text = get_nested(condition_data, ["data", "text"])
        self.condition = ChatskyCondition(name="", condition=ExactMatchCondition(match=text))

    def _convert(self) -> dict:
        return {"chatsky.conditions.ExactMatch": {"match": {"chatsky.Message": self.condition.condition.match}}}


class IncludeTextConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        text = get_nested(condition_data, ["data", "text"])
        self.condition = ChatskyCondition(name="", condition=IncludeTextCondition(text=text))

    def _convert(self) -> dict:
        return {"chatsky.conditions.HasText": {"text": self.condition.condition.text}}


class RegexpConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        pattern = get_nested(condition_data, ["data", "pattern"])
        flags = get_nested(condition_data, ["data", "flags"])
        self.condition = ChatskyCondition(name="", condition=RegexpCondition(pattern=pattern, flags=flags))

    def _map_flags(self, flags: dict) -> int:
        flag_value = 0
        if not flags.get("caseSensitive", False):
            flag_value |= re.IGNORECASE.value
        return flag_value

    def _convert(self) -> dict:
        return {
            "chatsky.conditions.Regexp": {
                "pattern": self.condition.condition.pattern,
                "flags": self._map_flags(self.condition.condition.flags),
            }
        }


class NotConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        # Save the raw data for later extraction of the negated condition.
        self.raw_condition_data = condition_data
        self.condition = ChatskyCondition(name="", condition=NotCondition(condition=condition_data))

    def _convert(self) -> dict:
        # Extract the nested condition; assumes structure: {"data": {...}}
        negated_data = get_nested(self.raw_condition_data, ["data", "data"])
        structure = get_nested(negated_data, ["structure"])
        converter_class = ChatskyConditionConverter.MAP_CONDITION.get(structure)
        if not converter_class:
            raise BadConditionException(f"Unsupported condition structure: {structure}")
        negated_converter = converter_class({"data": negated_data})
        return {"chatsky.conditions.Not": negated_converter()}


class AllOfConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        conditions = get_nested(condition_data, ["data", "data"])
        self.condition = ChatskyCondition(name="", condition=AllOfCondition(conditions=conditions))

    def _convert(self) -> dict:
        converted_conditions = []
        for cnd in self.condition.condition.conditions:
            structure = cnd.get("structure")
            converter_class = ChatskyConditionConverter.MAP_CONDITION.get(structure)
            if not converter_class:
                raise BadConditionException(f"Unsupported condition structure in AllOf: {structure}")
            converted_conditions.append(converter_class({"data": cnd})())
        return {"chatsky.conditions.All": converted_conditions}


class AnyOfConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition_data: dict) -> None:
        conditions = get_nested(condition_data, ["data", "data"])
        self.condition = ChatskyCondition(name="", condition=AnyOfCondition(conditions=conditions))

    def _convert(self) -> dict:
        converted_conditions = []
        for cnd in self.condition.condition.conditions:
            structure = cnd.get("structure")
            converter_class = ChatskyConditionConverter.MAP_CONDITION.get(structure)
            if not converter_class:
                raise BadConditionException(f"Unsupported condition structure in AnyOf: {structure}")
            converted_conditions.append(converter_class({"data": cnd})())
        return {"chatsky.conditions.Any": converted_conditions}


class ChatskyConditionConverter(ConditionConverter):
    MAP_CONDITION = {
        "exactMatch": ExactMatchConditionConverter,
        "includeText": IncludeTextConditionConverter,
        "regExp": RegexpConditionConverter,
        "not": NotConditionConverter,
        "allOf": AllOfConditionConverter,
        "anyOf": AnyOfConditionConverter,
    }

    def __init__(self, condition_data: dict) -> None:
        structure = get_nested(condition_data, ["data", "structure"])
        converter_class = self.MAP_CONDITION.get(structure)
        if not converter_class:
            raise BadConditionException(f"Unsupported condition structure: {structure}")
        self.condition_converter = converter_class(condition_data)

    def __call__(self, *args, **kwargs) -> dict:
        return self.condition_converter(*args, **kwargs)

    def _convert(self) -> dict:
        return self.condition_converter._convert()

    def get_pre_transitions(self) -> dict:
        return self.condition_converter.get_pre_transitions()
