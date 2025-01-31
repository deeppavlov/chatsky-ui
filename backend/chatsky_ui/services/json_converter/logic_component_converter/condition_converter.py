from abc import ABC, abstractmethod

from ....core.config import settings
from ....schemas.front_graph_components.info_holders.condition import *
from ..base_converter import BaseConverter
from ..consts import CONDITIONS_FILE, CUSTOM_FILE
from .service_replacer import store_custom_service


class BadConditionException(Exception):
    pass


class ConditionConverter(BaseConverter, ABC):
    @abstractmethod
    def get_pre_transitions():
        raise NotImplementedError


class CustomConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        self.condition = None
        try:
            self.condition = CustomCondition(
                name=condition["name"],
                code=condition["data"]["python"]["action"],
            )
        except KeyError as missing_key:
            raise BadConditionException("Missing key in custom condition data") from missing_key

    def _convert(self):
        store_custom_service(settings.conditions_path, [self.condition.code])
        custom_cnd = {f"{CUSTOM_FILE}.{CONDITIONS_FILE}.{self.condition.name}": None}
        return custom_cnd

    def get_pre_transitions(self):
        return {}


class SlotConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        self.condition = None
        try:
            self.condition = SlotCondition(slot_id=condition["data"]["slot"], name=condition["name"])
        except KeyError as missing_key:
            raise BadConditionException("Missing key in slot condition data") from missing_key

    def __call__(self, *args, **kwargs):
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        return {"chatsky.conditions.slots.SlotsExtracted": self.slots_conf[self.condition.slot_id]}

    def get_pre_transitions(self):
        slot_path = self.slots_conf[self.condition.slot_id]  # type: ignore
        return {slot_path: {"chatsky.processing.slots.Extract": slot_path}}


class ChatskyConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        if condition["type"] != "basic":
            raise BadConditionException("Unsupported condition type '%s'" % condition["type"])

        structure = condition["data"]["structure"]
        cnd_details = condition["data"][structure]
        if structure in ["All", "Any"]:
            cnd_details = [ChatskyConditionConverter(cnd).condition for cnd in cnd_details]
            print(f"cnd_details {structure} condition to {cnd_details}")
        elif structure == "Not":
            cnd_details = ChatskyConditionConverter(cnd_details).condition
            print(f"Converted Not condition to {cnd_details}")

        if isinstance(cnd_details, dict):
            self.condition = globals()[structure](**cnd_details) 
            print(f"Converted {structure} condition to {cnd_details}")
        elif isinstance(cnd_details, list):
            self.condition = globals()[structure](*cnd_details)
            print(f"Converted {structure} condition to {cnd_details}")
        else:
            self.condition = globals()[structure](cnd_details)
            print(f"Converted {structure} condition to {cnd_details}")
        

    def _convert(self):
        return {f"chatsky.conditions.{self.condition.__class__.__name__}": self.condition.model_dump()}

    def get_pre_transitions(self):
        return {}
