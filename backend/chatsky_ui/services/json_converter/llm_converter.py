from typing import List

from ...schemas.front_graph_components.llm_model import LLMModel
from .base_converter import BaseConverter


class LLMModelsConverter(BaseConverter):
    def __init__(self, llm_models_config: List[dict]):
        self.models = [
            LLMModel(
                name=config["name"],
                llm=config["modelName"],
                system_prompt=config.get("systemPrompt"),
            )
            for config in llm_models_config
        ]

    def _convert(self):
        return {
            model.name: {
                "chatsky.llm.LLM_API": {
                    "model": {
                        "external:langchain_openai.ChatOpenAI": {
                            "model": model.llm,
                            "api_key": {"external:os.getenv": model.MODEL_TO_KEY[model.llm]},
                            "base_url": {"external:os.getenv": "LLM_API_BASE_URL"},
                        }
                    },
                    "system_prompt": model.system_prompt,
                }
            }
            for model in self.models
        }
