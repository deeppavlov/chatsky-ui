from abc import ABC, abstractmethod

from ....core.config import settings
from ....schemas.front_graph_components.info_holders.condition import CustomCondition, SlotCondition
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
