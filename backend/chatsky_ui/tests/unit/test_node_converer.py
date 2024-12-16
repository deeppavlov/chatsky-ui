from chatsky_ui.services.json_converter.node_converter import InfoNodeConverter, LinkNodeConverter


class TestNodeConverter:
    def test_info_node_converter(self, info_node, slots_conf, chatsky_node):
        converted_node = InfoNodeConverter(info_node)(slots_conf=slots_conf)

        assert converted_node == chatsky_node

    def test_link_node_converter(self):
        link_node = {
            "id": "test_link_node",
            "data": {"transition": {"target_flow": "test_flow", "target_node": "test_node_id"}},
        }
        mapped_flows = {"test_flow": {"test_node_id": {"data": {"name": "test_node"}}}}

        converted_node = LinkNodeConverter(link_node)(mapped_flows=mapped_flows)

        assert converted_node == ["test_flow", "test_node"]
