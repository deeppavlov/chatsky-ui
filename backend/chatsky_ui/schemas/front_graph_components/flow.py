from typing import List

from .base_component import BaseComponent


class Flow(BaseComponent):
    name: str
    nodes: List[dict]
    edges: List[dict]
