from typing import List

from .base_component import BaseComponent


class Pipeline(BaseComponent):
    flows: List[dict]
    messenger: dict
