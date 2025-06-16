from typing import Optional

from ..base_component import BaseComponent


class Response(BaseComponent):
    name: str


class TextResponse(Response):
    text: str


class CustomResponse(Response):
    code: str


class LLMResponse(Response):
    model_name: str
    prompt: Optional[str] = None
    context_memory_index: Optional[int] = None
