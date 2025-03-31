from ...schemas.front_graph_components.messenger import Messenger
from .base_converter import BaseConverter


class MessengerConverter(BaseConverter):
    """Converts frontend's `Messenger` to a Chatsky `MessengerInterface`.

    Supports `HTTPMessengerInterface` and `TelegramInterface` at the moment.
    """

    def __init__(self, messenger: dict):
        """Creates an `InterfaceConverter` object. Makes an `Messenger` schema from a given dictionary.

        Args:
            messenger (dict): A frontend's `Messenger` dictionary which will be converted.
                In this dictionary either `http` or `telegram` field must be set, but not both.

        Raises:
            ValueError: if both `HTTPMessengerInterface` or `TelegramInterface` are passed,
                or if none of them are passed. Also, if `TG_BOT_TOKEN` isn't set, while `TelegramInterface`
                is being used.
        """
        self.messenger = Messenger(**messenger)

    def _convert(self):
        """Converts frontend's `Interface` to a Chatsky `MessengerInterface` then returns it.

        For `HTTPMessengerInterface` the port will be set to an environment variable named `CHATSKY_PORT`,
        or `8020` by default, if the variable isn't set.
        """
        if self.messenger.web is not None:
            return {
                "external:chatsky_ui.clients.http_interface.HTTPMessengerInterface": {
                    "port": self.messenger.chatsky_port
                }
            }
        elif self.messenger.telegram is not None:
            return {
                "chatsky.messengers.TelegramInterface": {"token": {"external:os.getenv": self.messenger.tg_token_name}}
            }
