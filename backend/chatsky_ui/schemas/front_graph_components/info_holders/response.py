from typing import List, Optional

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


class Button(BaseComponent):
    """
    Here, "text" is the displayed name of the button,
    "callback_data" is only relevant for "inline" buttons.
    """

    text: str
    callback_data: str = None


class ButtonResponse(Response):
    text: str
    button_type: str
    buttons: List[List[dict]]
