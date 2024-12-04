from .base_converter import BaseConverter
from ...schemas.front_graph_components.interface import Interface

class InterfaceConverter(BaseConverter):
    def __init__(self, interface: dict):
        self.interface = Interface(**interface)

    def _convert(self):
        if self.interface.cli is not None:
            return {"chatsky.messengers.console.CLIMessengerInterface": {}}
        elif self.interface.telegram is not None:
            return {
                "chatsky.messengers.telegram.LongpollingInterface": {"token": self.interface.telegram["token"]}
            }
