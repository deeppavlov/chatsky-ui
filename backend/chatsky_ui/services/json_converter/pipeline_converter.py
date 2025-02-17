from pathlib import Path
from typing import Optional

import yaml

try:
    from yaml import CDumper as Dumper
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader, Dumper

from ...schemas.front_graph_components.pipeline import Pipeline
from .base_converter import BaseConverter
from .consts import UNIQUE_BUILD_TOKEN
from .messenger_converter import MessengerConverter
from .script_converter import ScriptConverter
from .slots_converter import SlotsConverter


class PipelineConverter(BaseConverter):
    def __call__(self, build_id: int, input_file: Path, output_dir: Path, messenger: str, chatsky_port: Optional[int]):
        self.from_yaml(file_path=input_file)

        self.pipeline = Pipeline(
            messenger={
                messenger: {},
                "chatsky_port": chatsky_port,
                "tg_token_name": UNIQUE_BUILD_TOKEN.format(build_id=build_id),
            },
            **self.graph,
        )

        self.converted_pipeline = super().__call__()

        self.to_yaml(dir_path=output_dir)

    def from_yaml(self, file_path: Path):
        with open(str(file_path), "r", encoding="UTF-8") as file:
            self.graph = yaml.load(file, Loader=Loader)

    def to_yaml(self, dir_path: Path):
        with open(f"{dir_path}/build.yaml", "w", encoding="UTF-8") as file:
            yaml.dump(self.converted_pipeline, file, Dumper=Dumper, default_flow_style=False)

    def _convert(self):
        slots_converter = SlotsConverter(self.pipeline.flows)
        script_converter = ScriptConverter(self.pipeline.flows)

        slots_conf = slots_converter.map_slots()
        start_label, fallback_label = script_converter.extract_start_fallback_labels()

        return {
            "script": script_converter(slots_conf=slots_conf),
            "messenger_interface": MessengerConverter(self.pipeline.messenger)(),
            "slots": slots_converter(),
            "start_label": start_label,
            "fallback_label": fallback_label,
        }
