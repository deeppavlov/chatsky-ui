from ....core.config import settings
from ....schemas.front_graph_components.info_holders.response import CustomResponse, TextResponse
from ..base_converter import BaseConverter
from ..consts import CUSTOM_FILE, RESPONSES_FILE
from .service_replacer import store_custom_service


class BadResponseException(Exception):
    """An exception raised when a converter receives a response which doesn't have required fields."""

    pass


class ResponseConverter(BaseConverter):
    """Converts frontend's `Response` into a Chatsky `Response`. It's a base class for other converters."""

    pass


class TextResponseConverter(ResponseConverter):
    """Converts a frontend's `TextResponse` into a Chatsky `Response`."""

    def __init__(self, response: dict):
        """Creates a `TextResponseConverter` object.

        Args:
            response (dict): The `TextResponse` to be converted.

        Raises:
            BadResponseException: if the provided response doesn't have required fields.
        """
        try:
            self.response = TextResponse(
                name=response["name"],
                text=next(iter(response["data"]))["text"],
            )
        except KeyError as e:
            raise BadResponseException("Missing key in custom condition data") from e

    def _convert(self):
        """Converts the received text response into a Chatsky `Response`."""
        return {"chatsky.Message": {"text": self.response.text}}


class CustomResponseConverter(ResponseConverter):
    """Converts a frontend's `CustomResponse` into a Chatsky `Response`."""

    def __init__(self, response: dict):
        """Creates a `CustomResponseConverter` object.

        Args:
            response (dict): The `CustomResponse` to be converted.

        Raises:
            BadResponseException: if the provided response doesn't have required fields.
        """
        try:
            self.response = CustomResponse(
                name=response["name"],
                code=next(iter(response["data"]))["python"]["action"],
            )
        except KeyError as e:
            raise BadResponseException("Missing key in custom response data") from e

    def _convert(self):
        """Converts the received `CustomResponse` into a Chatsky `Response`.
        Saves the response into the "settings.responses_path" file. (appends it to the file)
        Then, returns an address of that response within the file.
        """
        store_custom_service(settings.responses_path, [self.response.code])
        return {f"{CUSTOM_FILE}.{RESPONSES_FILE}.{self.response.name}": None}
