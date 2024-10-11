from typing import List

from .base_converter import BaseConverter
from ...schemas.front_graph_components.node import InfoNode, LinkNode
from .logic_component_converter.response_converter import TextResponseConverter, CustomResponseConverter
from .logic_component_converter.condition_converter import CustomConditionConverter, SlotConditionConverter

from chatsky import RESPONSE, TRANSITIONS, PRE_TRANSITION


class NodeConverter(BaseConverter):
    RESPONSE_CONVERTER = {
        "text": TextResponseConverter,
        "python": CustomResponseConverter,
    }
    CONDITION_CONVERTER = {
        "python": CustomConditionConverter,
        "slot": SlotConditionConverter,
    }

    def __init__(self, config: dict):
        pass


class InfoNodeConverter(NodeConverter):
    def __init__(self, node: dict):
        self.node = InfoNode(
            id=node["id"],
            name=node["data"]["name"],
            response=node["data"]["response"],
            conditions=node["data"]["conditions"],
        )
    
    def __call__(self, *args, **kwargs):
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)
    
    def _convert(self):
        condition_converters = [self.CONDITION_CONVERTER[condition["type"]](condition) for condition in self.node.conditions]
        return {
            RESPONSE: self.RESPONSE_CONVERTER[self.node.response["type"]](self.node.response)(),
            TRANSITIONS: [
                {
                    "dst": condition["dst"],
                    "priority": condition["data"]["priority"],
                    "cnd": converter(slots_conf=self.slots_conf)
                } for condition, converter in zip(self.node.conditions, condition_converters)
            ],
            PRE_TRANSITION: {
                key: value
                for converter in condition_converters
                for key, value in converter.get_pre_transitions().items()
            }
        }


class LinkNodeConverter(NodeConverter):
    def __init__(self, config: dict):
        self.node = LinkNode(
            id=config["id"],
            target_flow_name=config["data"]["transition"]["target_flow"],
            target_node_id=config["data"]["transition"]["target_node"],
        )

    def __call__(self, *args, **kwargs):
        self.mapped_flows = kwargs["mapped_flows"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        return [
            self.node.target_flow_name,
            self.mapped_flows[self.node.target_flow_name][self.node.target_node_id]["data"]["name"],
        ]


class ConfNodeConverter(NodeConverter):
    def __init__(self, config: dict):
        super().__init__(config)
        

    def _convert(self):
        return {
            # node.name: node._convert() for node in self.nodes
        }


class SlotsNodeConverter(ConfNodeConverter):
    def __init__(self, config: List[dict]):
        self.slots = config

    def _convert(self):
        return {
            # node.name: node._convert() for node in self.nodes
        }
