from typing import List

from .base_converter import BaseConverter
from .flow_converter import FlowConverter
from ...schemas.front_graph_components.script import Script


class ScriptConverter(BaseConverter):
    def __init__(self, flows: List[dict]):
        self.script = Script(flows=flows)
        self.mapped_flows = self._map_flows() #TODO: think about storing this in a temp file

    def __call__(self, *args, **kwargs):
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        return {
            key: value
            for flow in self.script.flows
            for key, value in FlowConverter(flow)(
                mapped_flows=self.mapped_flows,
                slots_conf=self.slots_conf
            ).items()
        }

    def _map_flows(self):
        mapped_flows = {}
        for flow in self.script.flows:
            mapped_flows[flow["name"]] = {}
            for node in flow["data"]["nodes"]:
                mapped_flows[flow["name"]][node["id"]] = node
        return mapped_flows

