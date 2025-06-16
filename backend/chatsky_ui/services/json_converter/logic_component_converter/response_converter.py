import asyncio
from ....core.config import settings
from ....schemas.front_graph_components.info_holders.response import CustomResponse, LLMResponse, TextResponse
from ..base_converter import BaseConverter
from ..consts import CUSTOM_FILE, RESPONSES_FILE
from .service_replacer import store_custom_service
from chatsky_ui.utils.llm_config_helper import get_llm_model_config

#TODO: in FRONT change the structure of responses data to be like in conditions (a dict instead of list)

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
            raise BadResponseException("Missing key in custom response data") from e

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


class LLMResponseConverter(ResponseConverter):
    def __init__(self, response: dict):
        super().__init__()
        try:
            data = next(iter(response["data"]))
            config_model_name = self._get_model_config(response)["name"]
            self.response = LLMResponse(
                name=response["name"],
                model_name=config_model_name,
                prompt=data["llm"]["prompt"],
                context_memory_index=data["llm"].get("context_memory_index"),
            )
        except KeyError as e:
            raise BadResponseException("Missing key in LLM response data") from e

    def _get_model_config(self, response: dict):
        """Fetches the model configuration for the LLM response.
        Args:
            response (dict): The LLM response to be converted.
        Returns:
            dict: The model configuration for the LLM response.
        """
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_llm_model_config(response["data"][0]["llm"]["llm_config_id"]))

    def _convert(self):
        return {"chatsky.responses.llm.LLMResponse": self.response.model_dump()}
