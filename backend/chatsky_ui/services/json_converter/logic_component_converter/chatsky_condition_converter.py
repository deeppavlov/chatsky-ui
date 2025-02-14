from abc import ABC, abstractmethod

from ....schemas.front_graph_components.info_holders.condition import ChatskyCondition, ExactMatchCondition, IncludeTextCondition, RegexpCondition, NotCondition, AllOfCondition, AnyOfCondition
from .condition_converter import ConditionConverter, BadConditionException


class BaseChatskyConditionConverter(ConditionConverter, ABC):
    def __init__(self, condition: dict):
        self.condition: ChatskyCondition

    def _convert(self):
        if not self.condition or not self.condition.condition:
            raise BadConditionException("Condition is not properly initialized")
        return {f"chatsky.conditions.{self.condition.condition.__class__.__name__}": self.condition.condition.model_dump()}


class ExactMatchConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(name="", condition=ExactMatchCondition(match=condition["data"]["text"]))
        except KeyError as missing_key:
            raise BadConditionException("Missing key in exact match condition data") from missing_key    
    
    def _convert(self):
        return {"chatsky.conditions.ExactMatch": {"match": {"chatsky.Message": self.condition.condition.match}}}

    def get_pre_transitions(self):
        return {}


class IncludeTextConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(name="", condition=IncludeTextCondition(text=condition["data"]["text"]))
        except KeyError as missing_key:
            raise BadConditionException("Missing key in include text condition data") from missing_key

    def _convert(self):
        return {"chatsky.conditions.HasText": {"text": self.condition.condition.text}}

    def get_pre_transitions(self):
        return {}


class RegexpConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(name="", condition=RegexpCondition(pattern=condition["data"]["pattern"], flags=condition["data"]["flags"]))
        except KeyError as missing_key:
            raise BadConditionException("Missing key in regexp condition data") from missing_key

    def _map_flags(self, flags: dict):
        flag_value = 0
        if flags.get("ignoreCase", "false") == "true":
            flag_value |= 2  # re.IGNORECASE
        return flag_value

    def _convert(self):
        return {"chatsky.conditions.Regexp": {"pattern": self.condition.condition.pattern, "flags": self._map_flags(self.condition.condition.flags)}}

    def get_pre_transitions(self):
        return {}


class NotConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(
                name="",
                condition=NotCondition(condition=condition)
            )
        except KeyError as missing_key:
            raise BadConditionException("Missing key in not condition data") from missing_key

    def _convert(self):
        cnd = self.condition.condition.condition["data"]
        self.negated_cnd = ChatskyConditionConverter.MAP_CONDITION[cnd["data"]["structure"]](
            cnd
        )
        return {"chatsky.conditions.Not": self.negated_cnd()}

    def get_pre_transitions(self):
        return {}


class AllOfConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(name="", condition=AllOfCondition(conditions=condition["data"]["data"]))
        except KeyError as missing_key:
            raise BadConditionException("Missing key in all of condition data") from missing_key

    def _convert(self):
        converted_cnds = []
        for cnd in self.condition.condition.conditions:
            converted_cnds.append(ChatskyConditionConverter.MAP_CONDITION[cnd["structure"]]({"data":cnd})())

        return {"chatsky.conditions.All": converted_cnds}

    def get_pre_transitions(self):
        return {}
    

class AnyOfConditionConverter(BaseChatskyConditionConverter):
    def __init__(self, condition: dict):
        try:
            self.condition = ChatskyCondition(name="", condition=AnyOfCondition(conditions=condition["data"]["data"]))
        except KeyError as missing_key:
            raise BadConditionException("Missing key in any of condition data") from missing_key

    def _convert(self):
        converted_cnds = []
        for cnd in self.condition.condition.conditions:
            converted_cnds.append(ChatskyConditionConverter.MAP_CONDITION[cnd["structure"]]({"data":cnd})())

        return {"chatsky.conditions.Any": converted_cnds}

    def get_pre_transitions(self):
        return {}
    

class ChatskyConditionConverter(ConditionConverter):
    MAP_CONDITION = {
        "exactMatch": ExactMatchConditionConverter,
        "includeText": IncludeTextConditionConverter,
        "regexp": RegexpConditionConverter,
        "not": NotConditionConverter,
        "allOf": AllOfConditionConverter,
        "anyOf": AnyOfConditionConverter,
    }
    def __init__(self, condition: dict):
        structure = condition["data"]["structure"]
        self.condition_converter = ChatskyConditionConverter.MAP_CONDITION[structure](condition)

    def __call__(self, *args, **kwargs):
        return self.condition_converter.__call__(*args, **kwargs)

    def _convert(self):
        return self.condition_converter._convert()

    def get_pre_transitions(self):
        return self.condition_converter.get_pre_transitions()
