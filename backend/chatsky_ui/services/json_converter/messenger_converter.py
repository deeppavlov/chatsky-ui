from ...schemas.front_graph_components.messenger import Messenger
from .base_converter import BaseConverter


class MessengerConverter(BaseConverter):
    def __init__(self, messenger: dict):
        self.messenger = Messenger(**messenger)

    def _convert(self):
        if self.messenger.web is not None:
            return {"chatsky.messengers.HTTPMessengerInterface": {"port": self.messenger.chatsky_port}}
        elif self.messenger.telegram is not None:
            return {
                "chatsky.messengers.TelegramInterface": {"token": {"external:os.getenv": self.messenger.tg_token_name}}
            }
