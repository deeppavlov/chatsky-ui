from ..base_component import BaseComponent


class Condition(BaseComponent):
    name: str


class CustomCondition(Condition):
    code: str


class SlotCondition(Condition):
    slot_id: str  # not the condition id
