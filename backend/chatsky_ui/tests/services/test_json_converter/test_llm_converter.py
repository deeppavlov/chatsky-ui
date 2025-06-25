import os

from chatsky_ui.services.json_converter.llm_converter import LLMModelsConverter


class TestLLMModelsConverter:
    def test_llm_models_converter(self, llm_models_config, chatsky_llm_models):
        os.environ["OPENAI_API_KEY"] = "some_token"
        converted_models = LLMModelsConverter(llm_models_config)()

        assert converted_models == chatsky_llm_models
