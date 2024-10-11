import ast

from ..base_converter import BaseConverter
from ....schemas.front_graph_components.info_holders.response import TextResponse, CustomResponse
from ..consts import CUSTOM_FILE, RESPONSES_FILE


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
        # self.code = 
        self.response = CustomResponse(
            name=response["name"],
            code=next(iter(response["data"]))["python"]["action"],
        )

    def _parse_code(self):
        response_code = next(iter(ast.parse(self.response.code).body))

        if not isinstance(response_code, ast.ClassDef):
            raise ValueError("Response python code is not a ClassDef")
        return response_code
    
    def _convert(self):
        return {
            f"{CUSTOM_FILE}.{RESPONSES_FILE}.{self.response.name}": None
        }

