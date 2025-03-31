from logging import getLogger
from typing import Any, Dict, List, Tuple

from ...schemas.front_graph_components.flow import Flow
from .base_converter import BaseConverter
from .node_converter import InfoNodeConverter, LinkNodeConverter


class FlowConverter(BaseConverter):
    """Converts frontend's `Flow` into a Chatsky `Flow`."""

    NODE_CONVERTERS = {
        "default_node": InfoNodeConverter,
        "link_node": LinkNodeConverter,
    }

    def __init__(self, flow: Dict[str, Any]):
        """Creates a `FlowConverter` object. Validates received flow's structure.

        Args:
            flow (Dict[str, Any]): The `Flow` that will be converted.
        """
        self._validate_flow(flow)
        self.flow = Flow(
            name=flow["name"],
            nodes=flow["data"]["nodes"],
            edges=flow["data"]["edges"],
        )
        self._logger = None

    @property
    def logger(self):
        """Returns this FlowConverter's `logger`. Sets `logger` to getLogger(__name__) if
        `logger` isn't defined in this FlowConverter yet, then returns it.
        """
        if self._logger is None:
            self._logger = getLogger(__name__)
        return self._logger

    def __call__(self, *args, **kwargs):
        """Converts saved data into a Chatsky `Flow` then returns it.

        Keyword Arguments:
            slots_conf: A dictionary with slot ids as keys and respective slot paths as values.
                It's passed for use in `SlotConditionConverter`.
            mapped_flows: A map (dict) of nodes with flows' names and nodes' ids as its keys.
                It's passed for use in `LinkNodeConverter`.

        Returns:
            A converted Chatsky `Flow`
        """
        self.mapped_flows = kwargs["mapped_flows"]
        self.slots_conf = kwargs["slots_conf"]
        self._integrate_edges_into_nodes()
        return super().__call__(*args, **kwargs)

    def _validate_flow(self, flow: Dict[str, Any]):
        """Checks that the received frontend's `Flow` matches the `Flow` schema.

        Raises:
            ValueError: In case the flow doesn't match the schema.
        """
        if "data" not in flow or "nodes" not in flow["data"] or "edges" not in flow["data"]:
            raise ValueError("Invalid flow structure")

    def _integrate_edges_into_nodes(self):
        """Converts frontend's `edges` into `TRANSITIONS` in a Chatsky `Flow`"""

        def _insert_dst_into_condition(
            node: Dict[str, Any], condition_id: str, target_node: Tuple[str, str]
        ) -> Dict[str, Any]:
            """Adds a destination to an existing condition, which is equivalent to
            adding a `Transition` to a `Flow`.

            Args:
                node (Dict[str, Any]): The node which contains the condition.
                condition_id (str): Id of the condition to be modified.
                target_node (Tuple[str, str]): Destination node of the `Transition`.

            Returns:
                Dict[str, Any] - The modified node.
            """
            for condition in node["data"]["conditions"]:
                if condition["id"] == condition_id:
                    condition["dst"] = target_node
                    self.logger.debug(f"Inserted 'dst:{target_node}' pair into {condition_id}")
            return node

        maped_edges = self._map_edges()
        nodes = self.flow.nodes.copy()
        for edge in maped_edges:
            for idx, node in enumerate(nodes):
                if node["id"] == edge["source"]:
                    nodes[idx] = _insert_dst_into_condition(node, edge["sourceHandle"], edge["target"])
        self.flow.nodes = nodes

    def _map_edges(self) -> List[Dict[str, Any]]:
        """Maps the edges of this flow, meaning it changes every edge's `target` from just a node_id to the
        target_node's flow and node name. Doesn't change the original flow's `edges`, returns a modified copy.
        """

        def _get_flow_and_node_names(target_node):
            """Fetches the received node's original flow and node names.
            In case it's a `LinkNode`, it fetches this data from the node the link is pointing to.
            That's because, unlike the frontend, Chatsky doesn't have `LinkNode`s.

            Args:
                target_node: a `Node` schema object.

            Returns:
                [flow_name, node_name] - a list.
            """
            node_type = target_node["type"]
            if node_type == "link_node":  # TODO: WHY CONVERTING HERE?
                return LinkNodeConverter(target_node)(mapped_flows=self.mapped_flows)
            elif node_type == "default_node":
                return [self.flow.name, target_node["data"]["name"]]

        edges = self.flow.edges.copy()
        for edge in edges:
            target_id = edge["target"]
            target_node = self.mapped_flows[self.flow.name].get(target_id)
            if target_node:
                edge["target"] = _get_flow_and_node_names(target_node)
        return edges

    def _convert(self) -> Dict[str, Any]:
        """Converts the received flow into a Chatsky `Flow` then returns it.
        Passes `slots_conf` to `InfoNodeConverter` for use in `SlotConditionConverter`.
        """
        converted_flow = {self.flow.name: {}}
        for node in self.flow.nodes:
            if node["type"] == "default_node":
                converted_flow[self.flow.name].update(
                    {node["data"]["name"]: InfoNodeConverter(node)(slots_conf=self.slots_conf)}
                )
        return converted_flow
