from .base_converter import BaseConverter
from ...schemas.front_graph_components.interface import Interface

class InterfaceConverter(BaseConverter):
    def __init__(self, interface: dict):
        self.interface = Interface(**interface)

    def _convert(self):
        return self.interface.model_dump()
