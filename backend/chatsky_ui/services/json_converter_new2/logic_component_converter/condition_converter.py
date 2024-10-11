from abc import ABC, abstractmethod
import ast

from ..consts import CUSTOM_FILE, CONDITIONS_FILE
from ..base_converter import BaseConverter
from ....schemas.front_graph_components.info_holders.condition import CustomCondition, SlotCondition


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

    def _parse_code(self):
        condition_code = next(iter(ast.parse(self.condition.code).body))

        if not isinstance(condition_code, ast.ClassDef):
            raise ValueError("Condition python code is not a ClassDef")
        return condition_code

    def _convert(self):
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
