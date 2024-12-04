from typing import List

from .base_component import BaseComponent


class Script(BaseComponent):
    flows: List[dict]
