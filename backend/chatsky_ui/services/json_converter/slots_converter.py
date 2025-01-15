from typing import List

from ...schemas.front_graph_components.node import SlotsNode
from ...schemas.front_graph_components.slot import GroupSlot, RegexpSlot
from .base_converter import BaseConverter


class SlotsConverter(BaseConverter):
    def __init__(self, flows: List[dict]):
        def _get_slots_node(flows):
            slots_nodes = [node for flow in flows for node in flow["data"]["nodes"] if node["type"] == "slots_node"]
            if len(slots_nodes) > 1:
                raise ValueError("Only one slots_node is allowed")
            return next(
                iter(slots_nodes),
                {"id": "999999", "data": {"groups": []}},
            )

        slots_node = _get_slots_node(flows)
        self.slots_node = SlotsNode(
            id=slots_node["id"],
            groups=slots_node["data"]["groups"],
        )

    def map_slots(self):
        mapped_slots = {}
        for group in self.slots_node.groups.copy():
            for slot in group["slots"]:
                mapped_slots[slot["id"]] = ".".join([group["name"], slot["name"]])
        return mapped_slots

    def _convert(self):
        return {key: value for group in self.slots_node.groups for key, value in GroupSlotConverter(group)().items()}


class RegexpSlotConverter(SlotsConverter):
    def __init__(self, slot: dict):
        self.slot = RegexpSlot(
            id=slot["id"],
            name=slot["name"],
            regexp=slot["value"],
            match_group_idx=slot.get("match_group_idx", 1),
        )

    def _convert(self):
        return {
            self.slot.name: {
                "chatsky.slots.RegexpSlot": {
                    "regexp": self.slot.regexp,
                    "match_group_idx": self.slot.match_group_idx,
                }
            }
        }


class GroupSlotConverter(SlotsConverter):
    SLOTS_CONVERTER_TYPES = {
        "GroupSlot": "self",  # Placeholder, will be replaced in __init__
        "RegexpSlot": RegexpSlotConverter,
    }

    def __init__(self, slot: dict):
        # Replace the placeholder with the actual class reference
        self.SLOTS_CONVERTER_TYPES["GroupSlot"] = GroupSlotConverter

        self.slot = GroupSlot(
            name=slot["name"],
            slots=slot["slots"],
        )

    def _convert(self):
        return {
            self.slot.name: {
                key: value
                for slot in self.slot.slots
                for key, value in self.SLOTS_CONVERTER_TYPES[slot["type"]](slot)().items()
            }
        }
