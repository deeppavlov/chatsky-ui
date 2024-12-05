from ....core.config import settings
from ....schemas.front_graph_components.info_holders.response import CustomResponse, TextResponse
from ..base_converter import BaseConverter
from ..consts import CUSTOM_FILE, RESPONSES_FILE
from .service_replacer import store_custom_service


class BadResponseException(Exception):
    pass


class ResponseConverter(BaseConverter):
    pass


class TextResponseConverter(ResponseConverter):
    def __init__(self, response: dict):
        try:
            self.response = TextResponse(
                name=response["name"],
                text=next(iter(response["data"]))["text"],
            )
        except KeyError as e:
            raise BadResponseException("Missing key in custom condition data") from e

    def _convert(self):
        return {"chatsky.Message": {"text": self.response.text}}


class CustomResponseConverter(ResponseConverter):
    def __init__(self, response: dict):
        try:
            self.response = CustomResponse(
                name=response["name"],
                code=next(iter(response["data"]))["python"]["action"],
            )
        except KeyError as e:
            raise BadResponseException("Missing key in custom response data") from e

    def _convert(self):
        store_custom_service(settings.responses_path, [self.response.code])
        return {f"{CUSTOM_FILE}.{RESPONSES_FILE}.{self.response.name}": None}
