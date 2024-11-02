import pytest

from chatsky_ui.services.json_converter_new2.node_converter import InfoNodeConverter, LinkNodeConverter


class TestNodeConverter:
    def test_info_node_converter(self, info_node, slots_conf, converted_custom_response, converted_custom_condition):
        converted_node = InfoNodeConverter(info_node)(slots_conf=slots_conf)

        assert converted_node == {
                "RESPONSE": converted_custom_response,
                "TRANSITIONS": [
                    {
                        "dst": "dst_test_node",
                        "priority": 1,
                        "cnd": converted_custom_condition
                    }
                ],
                "PRE_TRANSITION": {},
            }

    def test_link_node_converter(self):
        link_node = {
            "id": "test_link_node",
            "data": {
                "transition": {
                    "target_flow": "test_flow",
                    "target_node": "test_node_id"
                }
            }
        }
        mapped_flows = {
            "test_flow": {
                "test_node_id": {
                    "data": {
                        "name": "test_node"
                    }
                }
            }
        }

        converted_node = LinkNodeConverter(link_node)(mapped_flows=mapped_flows)

        assert converted_node == ["test_flow", "test_node"]
