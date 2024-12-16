from typing import List

from pydantic import model_validator

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

    @model_validator(mode="after")
    def check_unique_groups_names(cls, values) -> "SlotsNode":
        groups_names = [group["name"] for group in values.groups]
        if len(groups_names) != len(set(groups_names)):
            raise ValueError(f"Slot groups names should be unique. Got duplicates: {groups_names}")
        return values
