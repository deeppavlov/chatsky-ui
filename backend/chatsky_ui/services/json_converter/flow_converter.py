from logging import getLogger
from typing import Any, Dict, List, Tuple

from ...schemas.front_graph_components.flow import Flow
from .base_converter import BaseConverter
from .node_converter import InfoNodeConverter, LinkNodeConverter


class FlowConverter(BaseConverter):
    NODE_CONVERTERS = {
        "default_node": InfoNodeConverter,
        "link_node": LinkNodeConverter,
    }

    def __init__(self, flow: Dict[str, Any]):
        self._validate_flow(flow)
        self.flow = Flow(
            name=flow["name"],
            nodes=flow["data"]["nodes"],
            edges=flow["data"]["edges"],
        )
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            self._logger = getLogger(__name__)
        return self._logger

    def __call__(self, *args, **kwargs):
        self.mapped_flows = kwargs["mapped_flows"]
        self.slots_conf = kwargs["slots_conf"]
        self._integrate_edges_into_nodes()
        return super().__call__(*args, **kwargs)

    def _validate_flow(self, flow: Dict[str, Any]):
        if "data" not in flow or "nodes" not in flow["data"] or "edges" not in flow["data"]:
            raise ValueError("Invalid flow structure")

    def _integrate_edges_into_nodes(self):
        def _insert_dst_into_condition(
            node: Dict[str, Any], condition_id: str, target_node: Tuple[str, str]
        ) -> Dict[str, Any]:
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
        def _get_flow_and_node_names(target_node):
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
        converted_flow = {self.flow.name: {}}
        for node in self.flow.nodes:
            if node["type"] == "default_node":
                converted_flow[self.flow.name].update(
                    {node["data"]["name"]: InfoNodeConverter(node)(slots_conf=self.slots_conf)}
                )
        return converted_flow
