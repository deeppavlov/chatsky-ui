from typing import List

from ...schemas.front_graph_components.script import Script
from .base_converter import BaseConverter
from .flow_converter import FlowConverter


class ScriptConverter(BaseConverter):
    """Converts frontend's `Script` into a Chatsky `Script`."""

    def __init__(self, flows: List[dict]):
        """Creates a `ScriptConverter` object. Also makes a map of the flows by name, then nodes by ids.

        Args:
            flows (List[dict]): A list of all the flows that the `Script` will contain.
        """
        self.script = Script(flows=flows)
        self.mapped_flows = self._map_flows()  # TODO: think about storing this in a temp file

    def __call__(self, *args, **kwargs):
        """Converts saved data into a Chatsky `Script` then returns it.

        Keyword Arguments:
            slots_conf: A dictionary with slot ids as keys and respective slot paths as values.
                It's passed for use in `SlotConditionConverter`.

        Returns:
            A converted Chatsky `Script`.
        """
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        """Converts saved flows into a Chatsky `Script` then returns it.
        Passes `mapped_flows` and `slots_conf` to `FlowConverter` for use in other converters.
        """
        return {
            key: value
            for flow in self.script.flows
            for key, value in FlowConverter(flow)(mapped_flows=self.mapped_flows, slots_conf=self.slots_conf).items()
        }

    def _map_flows(self):
        """Returns a map (dictionary) of nodes with flows' names and nodes' ids as its keys.
        This is later passed to `FlowConverter` to use in `LinkNodeConverter`, because it needs access to the
        entire `Script` to work.
        """
        mapped_flows = {}
        for flow in self.script.flows:
            mapped_flows[flow["name"]] = {}
            for node in flow["data"]["nodes"]:
                mapped_flows[flow["name"]][node["id"]] = node
        return mapped_flows

    def extract_start_fallback_labels(self):  # TODO: refactor this huge method
        """Finds the `start_label` and `fallback_label` nodes in the `Script` and returns them.

        Raises:
            ValueError: If multiple start or fallback nodes found.

        Returns:
            (start_label, fallback_label) - a tuple.
        """
        start_label, fallback_label = None, None

        for flow in self.script.flows:
            for node in flow["data"]["nodes"]:
                flags = node["data"].get("flags", [])

                if "start" in flags:
                    if start_label:
                        raise ValueError("Multiple start nodes found")
                    start_label = [flow["name"], node["data"]["name"]]
                if "fallback" in flags:
                    if fallback_label:
                        raise ValueError("Multiple fallback nodes found")
                    fallback_label = [flow["name"], node["data"]["name"]]

                if start_label and fallback_label:
                    return start_label, fallback_label

        return start_label, fallback_label  # return None, None
