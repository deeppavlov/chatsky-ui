from typing import Dict

from ...schemas.front_graph_components.llm_model import LLMModel
from .base_converter import BaseConverter


class LLMModelsConverter(BaseConverter):
    def __init__(self, llm_models_config: Dict[str, dict]):
        tokens = llm_models_config.get("tokens", {})
        config_models = llm_models_config.get("config_models", {})
        self.models = [
            LLMModel(
                name=config["name"],
                llm=config["model_name"],
                token_name=tokens[config["token_id"]]["name"],
                system_prompt=config.get("system_prompt"),
            )
            for _, config in config_models.items()
        ]

    def _convert(self):
        return {
            model.name: {
                "chatsky.llm.LLM_API": {
                    "model": {
                        "external:langchain_openai.ChatOpenAI": {
                            "model": model.llm,
                            "api_key": {"external:os.getenv": model.token_name},
                            "base_url": {"external:os.getenv": "LLM_API_BASE_URL"},
                        }
                    },
                    "system_prompt": model.system_prompt,
                }
            }
            for model in self.models
        }
