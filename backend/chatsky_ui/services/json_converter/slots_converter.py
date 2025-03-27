from typing import List

from ...schemas.front_graph_components.node import SlotsNode
from ...schemas.front_graph_components.slot import GroupSlot, RegexpSlot
from .base_converter import BaseConverter


class SlotsConverter(BaseConverter):
    """Converts frontend's `Slot` into a Chatsky `Slot`."""

    def __init__(self, flows: List[dict]):
        """Creates a `SlotsConverter` object. Finds the 'slots_node' in the `Flows` provided.
        (It's a node that contains all the slots)

        Args:
            flows (List[dict]): The `Flow` containing the `Slots` to be converted.
        """

        def _get_slots_node(flows):
            """Looks through the frontend's `Flows` to find the 'slots_node', then returns it.
            (It's a node that contains all the slots)

            Args:
                flows (List[dict]): The flows to look through.

            Raises:
                ValueError: In case there are several slots_nodes.

            Returns:
                The `slots_node` if it was found. Otherwise, {"id": "999999", "data": {"groups": []}} is returned.
            """
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
        """Creates and returns a map of all slots with slot_id's as keys and respective group and slot names,
        divided by a '.', as values. For example, "mapped_slots[id] == group_name.slot_name"
        Doesn't modify the class object, it's a static method.
        """
        mapped_slots = {}
        for group in self.slots_node.groups.copy():
            for slot in group["slots"]:
                mapped_slots[slot["id"]] = ".".join([group["name"], slot["name"]])
        return mapped_slots

    def _convert(self):
        """Converts every `Slot` found into a Chatsky `Slot`, using `GroupSlotConverter`s recursive features.

        Returns:
            A Chatsky `Slots` dictionary, ready to be passed into the Chatsky `Pipeline`.
        """
        return {key: value for group in self.slots_node.groups for key, value in GroupSlotConverter(group)().items()}


class RegexpSlotConverter(SlotsConverter):
    """Converts frontend's `RegexpSlot` into a Chatsky `RegexpSlot`."""

    def __init__(self, slot: dict):
        """Creates a `RegexpSlotConverter` object.

        Args:
            slot (dict): The `RegexpSlot` to be converted. If the given slot doesn't
                have a `match_group_idx` field, it defaults to `1`.
        """
        self.slot = RegexpSlot(
            id=slot["id"],
            name=slot["name"],
            regexp=slot["value"],
            match_group_idx=slot.get("match_group_idx", 0),
        )

    def _convert(self):
        """Converts the received `RegexpSlot` into a Chatsky `RegexpSlot` then returns it."""
        return {
            self.slot.name: {
                "chatsky.slots.RegexpSlot": {
                    "regexp": self.slot.regexp,
                    "match_group_idx": self.slot.match_group_idx,
                }
            }
        }


class GroupSlotConverter(SlotsConverter):
    """Converts frontend's implementation of `GroupSlot` into a Chatsky `GroupSlot`."""

    SLOTS_CONVERTER_TYPES = {
        "GroupSlot": "self",  # Placeholder, will be replaced in __init__
        "RegexpSlot": RegexpSlotConverter,
    }

    def __init__(self, slot: dict):
        """Creates a `GroupSlotConverter` object. Replaces a placeholder in `SLOTS_CONVERTER_TYPES` for easier
        class definition.

        Args:
            slot (dict): The `GroupSlot` to be converted.
        """
        # Replace the placeholder with the actual class reference
        self.SLOTS_CONVERTER_TYPES["GroupSlot"] = GroupSlotConverter

        self.slot = GroupSlot(
            name=slot["name"],
            slots=slot["slots"],
        )

    def _convert(self):
        """Converts the received `GroupSlot` into a Chatsky `GroupSlot` then returns it.
        (Recursively calls respective Slot Converters for every `Slot` contained in the `GroupSlot`)
        """
        return {
            self.slot.name: {
                key: value
                for slot in self.slot.slots
                for key, value in self.SLOTS_CONVERTER_TYPES[slot["type"]](slot)().items()
            }
        }
