from chatsky_ui.core.config import settings

from ...schemas.front_graph_components.interface import Interface
from .base_converter import BaseConverter


class InterfaceConverter(BaseConverter):
    """Converts frontend's `Interface` to a Chatsky `MessengerInterface`.
    Supports `HTTPMessengerInterface` and `TelegramInterface` at the moment.
    """
    def __init__(self, interface: dict):
        """Creates an `InterfaceConverter` object. Makes an `Interface` schema from a given dictionary.
        `TG_BOT_TOKEN` environment variable must be set, if `TelegramInterface` is being used.

        Args:
            interface (dict): A frontend's `Interface` dictionary which will be converted.
                In this dictionary either `http` or `telegram` field must be set, but not both.

        Raises:
            ValueError: if both `HTTPMessengerInterface` or `TelegramInterface` are passed,
                or if none of them are passed. Also, if `TG_BOT_TOKEN` isn't set, while `TelegramInterface`
                is being used.
        """
        self.interface = Interface(**interface)

    def _convert(self):
        """Converts frontend's `Interface` to a Chatsky `MessengerInterface` then returns it.
        For `HTTPMessengerInterface` the port will be set to an environment variable named `CHATSKY_PORT`,
        or `8020` by default, if the variable isn't set.
        """
        if self.interface.http is not None:
            return {"chatsky.messengers.HTTPMessengerInterface": {"port": settings.chatsky_port}}
        elif self.interface.telegram is not None:
            return {"chatsky.messengers.TelegramInterface": {"token": {"external:os.getenv": "TG_BOT_TOKEN"}}}
