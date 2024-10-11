from ..base_component import BaseComponent


class Response(BaseComponent):
    name: str


class TextResponse(Response):
    text: str


class CustomResponse(Response):
    code: str
