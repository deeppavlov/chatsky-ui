import ast

from ..base_converter import BaseConverter
from ....schemas.front_graph_components.info_holders.response import TextResponse, CustomResponse
from ..consts import CUSTOM_FILE, RESPONSES_FILE
from ....core.config import settings
from .service_replacer import store_custom_service


class ResponseConverter(BaseConverter):
    pass


class TextResponseConverter(ResponseConverter):
    def __init__(self, response: dict):
        self.response = TextResponse(
            name=response["name"],
            text=next(iter(response["data"]))["text"],
        )

    def _convert(self):
        return {
            "chatsky.Message": {
                "text": self.response.text
            }
        }


class CustomResponseConverter(ResponseConverter):
    def __init__(self, response: dict):
        self.response = CustomResponse(
            name=response["name"],
            code=next(iter(response["data"]))["python"]["action"],
        )

    def _convert(self):
        store_custom_service(settings.responses_path, [self.response.code])
        return {
            f"{CUSTOM_FILE}.{RESPONSES_FILE}.{self.response.name}": None
        }
