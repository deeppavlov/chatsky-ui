from abc import ABC, abstractmethod
import ast

from ..consts import CUSTOM_FILE, CONDITIONS_FILE
from ..base_converter import BaseConverter
from ....schemas.front_graph_components.info_holders.condition import CustomCondition, SlotCondition
from ....core.config import settings
from .service_replacer import store_custom_service


class ConditionConverter(BaseConverter, ABC):
    @abstractmethod
    def get_pre_transitions():
        raise NotImplementedError


class CustomConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        self.condition = CustomCondition(
            name=condition["name"],
            code=condition["data"]["python"]["action"],
        )

    def _convert(self):
        store_custom_service(settings.conditions_path, [self.condition.code])
        custom_cnd = {
            f"{CUSTOM_FILE}.{CONDITIONS_FILE}.{self.condition.name}": None
        }
        return custom_cnd
    
    def get_pre_transitions(self):
        return {}


class SlotConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        self.condition = SlotCondition(
            slot_id=condition["data"]["slot"],
            name=condition["name"]
        )

    def __call__(self, *args, **kwargs):
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        return {"chatsky.conditions.slots.SlotsExtracted": self.slots_conf[self.condition.slot_id]}

    def get_pre_transitions(self):
        slot_path = self.slots_conf[self.condition.slot_id]
        return {
            slot_path: {
                "chatsky.processing.slots.Extract": slot_path
            }
        }
