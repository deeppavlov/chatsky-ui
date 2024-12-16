from typing import List

from .base_component import BaseComponent


class Slot(BaseComponent):
    name: str


class RegexpSlot(Slot):
    id: str
    regexp: str
    match_group_idx: int


class GroupSlot(Slot):
    slots: List[dict]
