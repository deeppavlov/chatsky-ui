from typing import List

from .base_component import BaseComponent


class Node(BaseComponent):
    id: str


class InfoNode(Node):
    name: str
    response: dict
    conditions: List[dict]


class LinkNode(Node):
    target_flow_name: str
    target_node_id: str


class SlotsNode(Node):
    groups: List[dict]
