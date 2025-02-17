from pathlib import Path

import pytest
import yaml

from chatsky_ui.services.json_converter.flow_converter import FlowConverter
from chatsky_ui.services.json_converter.messenger_converter import MessengerConverter
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


class TestMessengerConverter:
    def test_messenger_converter(self, telegram_messenger, chatsky_telegram_messenger):
        converted_messenger = MessengerConverter(telegram_messenger)()

        assert converted_messenger == chatsky_telegram_messenger

    # def test_messenger_fail_no_token(self, telegram_messenger):
    #     os.environ.pop("TG_BOT_TOKEN", None)
    #     with pytest.raises(ValueError):
    #         MessengerConverter(telegram_messenger)()

    def test_messenger_fail_multiple_messengers(self, telegram_messenger):
        messenger = {**telegram_messenger, "web": {}}

        with pytest.raises(ValueError):
            MessengerConverter(messenger)()


class TestPipelineConverter:
    def test_pipeline_converter(
        self, dummy_build_id, flow, chatsky_telegram_messenger, converted_group_slot, chatsky_flow
    ):
        pipeline = {"flows": [flow]}
        pipeline_path = Path(__file__).parent / "test_pipeline.yaml"
        with open(pipeline_path, "w") as file:
            yaml.dump(pipeline, file)
        # TODO: when adding the token validator to messenger:
        # os.environ[UNIQUE_BUILD_TOKEN.format(build_id=dummy_build_id)] = "some_token"

        PipelineConverter()(dummy_build_id, pipeline_path, Path(__file__).parent, "telegram", None)

        output_file = Path(__file__).parent / "build.yaml"
        with open(output_file) as file:
            converted_pipeline = yaml.load(file, Loader=yaml.Loader)
        output_file.unlink()
        pipeline_path.unlink()

        assert converted_pipeline == {
            "script": chatsky_flow,
            "messenger_interface": chatsky_telegram_messenger,
            "slots": converted_group_slot,
            "start_label": ["test_flow", "test_node"],
            "fallback_label": ["test_flow", "test_node"],
        }
