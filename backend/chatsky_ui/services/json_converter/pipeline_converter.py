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
    """Converts frontend's `Pipeline` into a Chatsky `Pipeline`.
    Reads input from a file and writes output into a file.
    """

    def __call__(self, build_id: int, input_file: Path, output_dir: Path, messenger: str, chatsky_port: Optional[int]):
        """Reads frontend's `Pipeline` from the input_file, converts it into a Chatsky `Pipeline`,
        then writes it into the output_file.

        Args:
            input_file (Path): File containing Chatsky-UI `Pipeline`. Currently, it's "frontend_flows.yaml".
            output_dir (Path): The directory to write the Chatsky `Pipeline` file into.
                The file with the `Pipeline` will be named "build.yaml".
            messenger (str): The messenger to use. Currently, "telegram" and "web" are supported.
            chatsky_port (Optional[int]): The port for the `HTTPMessengerInterface`.
                Shouldn't be ignored if web messengr is used.
        """
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
        """Loads input from a YAML file. Uses PyYAML's `CLoader`, if possible, and `Loader` otherwise.

        Args:
            file_path (Path): Path to the .yaml file containing the frontend's `Pipeline`.
        """
        with open(str(file_path), "r", encoding="UTF-8") as file:
            self.graph = yaml.load(file, Loader=Loader)

    def to_yaml(self, dir_path: Path):
        """Writes output into a YAML file named 'build.yaml'.
        Uses PyYAML's `CDumper`, if possible, and `Dumper` otherwise.

        Args:
            dir_path (Path): Path to the directory, where the output .yaml file will be dumped.
        """
        with open(f"{dir_path}/build.yaml", "w", encoding="UTF-8") as file:
            yaml.dump(self.converted_pipeline, file, Dumper=Dumper, default_flow_style=False, allow_unicode=True)

    def _convert(self):
        """Converts the inputs into a Chatsky `Pipeline` and returns it. It really returns a dictionary, but since
        Chatsky's `Pipeline` is derived from Pydantic's `BaseModel`, it can be initialized from a dictionary,
        so this output is pretty much equivalent to a Chatsky `Pipeline`.
        """
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
