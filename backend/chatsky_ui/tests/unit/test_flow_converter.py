import os
from pathlib import Path

import pytest
import yaml

from chatsky_ui.services.json_converter.flow_converter import FlowConverter
from chatsky_ui.services.json_converter.interface_converter import InterfaceConverter
from chatsky_ui.services.json_converter.pipeline_converter import PipelineConverter
from chatsky_ui.services.json_converter.script_converter import ScriptConverter


@pytest.fixture
def chatsky_flow(chatsky_node):
    return {"test_flow": {"test_node": chatsky_node}}


class TestFlowConverter:
    def test_flow_converter(self, flow, mapped_flow, slots_conf, chatsky_flow):
        converted_flow = FlowConverter(flow)(mapped_flows=mapped_flow, slots_conf=slots_conf)

        assert converted_flow == chatsky_flow

    def test_flow_converter_fail_no_nodes(self, flow, mapped_flow, slots_conf):
        del flow["data"]["nodes"]
        with pytest.raises(ValueError):
            FlowConverter(flow)

    def test_flow_converter_fail_no_edges(self, flow, mapped_flow, slots_conf):
        del flow["data"]["edges"]

        with pytest.raises(ValueError):
            FlowConverter(flow)


class TestScriptConverter:
    def test_script_converter(self, flow, slots_conf, chatsky_flow):
        converted_script = ScriptConverter([flow])(slots_conf=slots_conf)

        assert converted_script == chatsky_flow

    def test_extract_start_fallback_labels(self, flow, slots_conf):
        converter = ScriptConverter([flow])
        converter(slots_conf=slots_conf)

        start, fallback = converter.extract_start_fallback_labels()

        assert start
        assert fallback

    def test_extract_start_fallback_labels_fail_no_labels(self, flow, slots_conf):
        flow["data"]["nodes"][0]["data"]["flags"] = []
        converter = ScriptConverter([flow])
        converter(slots_conf=slots_conf)

        start, fallback = converter.extract_start_fallback_labels()

        assert not start
        assert not fallback

    def test_extract_start_fallback_labels_fail_multiple_labels(self, flow, slots_conf):
        flow["data"]["nodes"][0]["data"]["flags"] = ["start"]
        flow["data"]["nodes"][1]["data"]["flags"] = ["start"]
        converter = ScriptConverter([flow])
        converter(slots_conf=slots_conf)

        with pytest.raises(ValueError):
            converter.extract_start_fallback_labels()


class TestInterfaceConverter:
    def test_interface_converter(self, telegram_interface, chatsky_telegram_interface):
        os.environ["TG_BOT_TOKEN"] = "some_token"

        converted_interface = InterfaceConverter(telegram_interface)()

        assert converted_interface == chatsky_telegram_interface

    def test_interface_fail_no_token(self, telegram_interface):
        os.environ.pop("TG_BOT_TOKEN", None)
        with pytest.raises(ValueError):
            InterfaceConverter(telegram_interface)()

    def test_interface_fail_multiple_interfaces(self, telegram_interface):
        interface = {**telegram_interface, "http": {}}

        with pytest.raises(ValueError):
            InterfaceConverter(interface)()


class TestPipelineConverter:
    def test_pipeline_converter(
        self, flow, telegram_interface, chatsky_telegram_interface, converted_group_slot, chatsky_flow
    ):
        pipeline = {"flows": [flow], "interface": telegram_interface}
        pipeline_path = Path(__file__).parent / "test_pipeline.yaml"
        with open(pipeline_path, "w") as file:
            yaml.dump(pipeline, file)
        os.environ["TG_BOT_TOKEN"] = "some_token"

        PipelineConverter()(pipeline_path, Path(__file__).parent)

        output_file = Path(__file__).parent / "build.yaml"
        with open(output_file) as file:
            converted_pipeline = yaml.load(file, Loader=yaml.Loader)
        output_file.unlink()
        pipeline_path.unlink()

        assert converted_pipeline == {
            "script": chatsky_flow,
            "messenger_interface": chatsky_telegram_interface,
            "slots": converted_group_slot,
            "start_label": ["test_flow", "test_node"],
            "fallback_label": ["test_flow", "test_node"],
        }
