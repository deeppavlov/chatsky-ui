from chatsky import PRE_RESPONSE, PRE_TRANSITION, RESPONSE, TRANSITIONS

from ...schemas.front_graph_components.node import InfoNode, LinkNode
from .base_converter import BaseConverter
from .logic_component_converter.chatsky_condition_converter import ChatskyConditionConverter
from .logic_component_converter.condition_converter import CustomConditionConverter, SlotConditionConverter
from .logic_component_converter.response_converter import CustomResponseConverter, TextResponseConverter


class NodeConverter(BaseConverter):
    """Base class for converting frontend's `Nodes` into Chatsky `Nodes`.
    Contains 'RESPONSE_CONVERTER' and 'CONDITION_CONVERTER' dictionaries so that the node's every condition and
    response are also converted with a converter of their respective type.
    """

    RESPONSE_CONVERTER = {
        "text": TextResponseConverter,
        "python": CustomResponseConverter,
    }
    CONDITION_CONVERTER = {
        "python": CustomConditionConverter,
        "slot": SlotConditionConverter,
        "basic": ChatskyConditionConverter,
    }

    def __init__(self, config: dict):
        pass


class InfoNodeConverter(NodeConverter):
    """Converts frontend's `InfoNode` into a Chatsky `Node`."""

    MAP_TR2CHATSKY = {
        "start": {"chatsky.destinations.Start": {}},
        "fallback": {"chatsky.destinations.Fallback": {}},
        "previous": {"chatsky.destinations.Previous": {}},
        "current": {"chatsky.destinations.Current": {}},
        "forward": {"chatsky.destinations.Forward": {}},
        "backward": {"chatsky.destinations.Backward": {}},
    }

    def __init__(self, node: dict):
        """Creates an `InfoNodeConverter` object.

        Args:
            node (dict): The `InfoNode` to be converted.
        """
        self.node = InfoNode(
            id=node["id"],
            name=node["data"]["name"],
            response=node["data"]["response"],
            conditions=node["data"]["conditions"],
        )

    def __call__(self, *args, **kwargs):
        """Converts saved data into a Chatsky `Node` then returns it.

        Keyword Arguments:
            slots_conf: A dictionary with slot ids as keys and respective slot paths as values.
                It's passed for use in `SlotConditionConverter`.

        Returns:
            A converted Chatsky `Node`.
        """
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        """Converts the received `InfoNode` into a Chatsky `Node` then returns it.
        Passes `slots_conf` to whichever condition converter is being used, it's needed for `SlotConditionConverter`,
        while `CustomConditionConverter` will just leave this parameter unused.
        """
        condition_converters = [
            self.CONDITION_CONVERTER[condition["type"]](condition) for condition in self.node.conditions
        ]
        return {
            RESPONSE: self.RESPONSE_CONVERTER[self.node.response["type"]](self.node.response)(),
            TRANSITIONS: [
                {
                    "dst": condition["dst"]
                    if condition["data"]["transition_type"] == "manual" and "dst" in condition
                    else self.MAP_TR2CHATSKY.get(condition["data"]["transition_type"], ""),
                    "priority": condition["data"]["priority"],
                    "cnd": converter(slots_conf=self.slots_conf),
                }
                for condition, converter in zip(self.node.conditions, condition_converters)
            ],
            PRE_TRANSITION: {
                key: value
                for converter in condition_converters
                for key, value in converter.get_pre_transitions().items()
            },
            PRE_RESPONSE: {"fill": {"chatsky.processing.FillTemplate": None}},
        }


class LinkNodeConverter(NodeConverter):
    """Converts frontend's `LinkNode` into a Chatsky `Node`."""

    def __init__(self, config: dict):
        """Creates an `InfoNodeConverter` object.

        Args:
            config (dict): The `LinkNode` to be converted.
        """
        self.node = LinkNode(
            id=config["id"],
            target_flow_name=config["data"]["transition"]["target_flow"],
            target_node_id=config["data"]["transition"]["target_node"],
        )

    def __call__(self, *args, **kwargs):
        """Converts saved data into a Chatsky `Node` then returns it.

        Keyword Arguments:
            mapped_flows: A map (dict) of nodes with flows' names and nodes' ids as its keys.
                It's required to fetch the target_node using its 'address'.

        Returns:
            A converted Chatsky `Node`.
        """
        self.mapped_flows = kwargs["mapped_flows"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        """Converts the received `LinkNode` into a Chatsky `Node` then returns it.
        Looks up the target_node using mapped_flows dictionary, then returns the target_node flow and node name.

        Returns:
            [target_node_flow_name, target_node_id]
        """
        return [
            self.node.target_flow_name,
            self.mapped_flows[self.node.target_flow_name][self.node.target_node_id]["data"]["name"],
        ]
