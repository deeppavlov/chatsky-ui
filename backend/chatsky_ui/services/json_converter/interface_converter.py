from ...schemas.front_graph_components.interface import Interface
from .base_converter import BaseConverter


class InterfaceConverter(BaseConverter):
    def __init__(self, interface: dict):
        self.interface = Interface(**interface)

    def _convert(self):
        if self.interface.http is not None:
            return {"chatsky.messengers.HTTPMessengerInterface": {}}
        elif self.interface.telegram is not None:
            return {"chatsky.messengers.TelegramInterface": {"token": {"external:os.getenv": "TG_BOT_TOKEN"}}}
