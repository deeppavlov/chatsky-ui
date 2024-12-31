from typing import List, Optional

from pydantic import Field

from .base_component import BaseComponent


class Pipeline(BaseComponent):
    flows: List[dict]
    interface: dict
    llmConfigurations: Optional[List[dict]] = Field(default=None)
