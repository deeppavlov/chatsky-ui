from typing import Dict, List, Optional

from pydantic import Field

from .base_component import BaseComponent


class Pipeline(BaseComponent):
    flows: List[dict]
    llm_configurations: Optional[Dict[str, dict]] = Field(default=None)
    messenger: dict
