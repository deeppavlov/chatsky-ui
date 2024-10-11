from pathlib import Path
import yaml
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

from ...schemas.front_graph_components.pipeline import Pipeline
from ...schemas.front_graph_components.interface import Interface
from ...schemas.front_graph_components.flow import Flow

from .base_converter import BaseConverter
from .flow_converter import FlowConverter
from .script_converter import ScriptConverter
from .interface_converter import InterfaceConverter
from .slots_converter import SlotsConverter


class PipelineConverter(BaseConverter):
    def __init__(self, pipeline_id: int):
        self.pipeline_id = pipeline_id

    def __call__(self, input_file: Path, output_dir: Path):
        self.from_yaml(file_path=input_file)
        self.pipeline = Pipeline(**self.graph)
        self.converted_pipeline = super().__call__()
        self.to_yaml(dir_path=output_dir)

    def from_yaml(self, file_path: Path):
        with open(str(file_path), "r", encoding="UTF-8") as file:
            self.graph = yaml.load(file, Loader=Loader)

    def to_yaml(self, dir_path: Path):
        with open(f"{dir_path}/build_{self.pipeline_id}.yaml", "w", encoding="UTF-8") as file:
            yaml.dump(self.converted_pipeline, file, Dumper=Dumper, default_flow_style=False)

    def _convert(self):
        slots_converter = SlotsConverter(self.pipeline.flows)
        slots_conf = slots_converter.map_slots()
        return {
            "script": ScriptConverter(self.pipeline.flows)(slots_conf=slots_conf),
            "interface": InterfaceConverter(self.pipeline.interface)(),
            "slots": slots_converter(),
            # "start_label": self.script.get_start_label(),
            # "fallback_label": self.script.get_fallback_label(),
        }
