import os
from typing import ClassVar, Optional

from dotenv import load_dotenv
from pydantic import Field

from chatsky_ui.core.config import settings

from .base_component import BaseComponent

load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)


class LLMModel(BaseComponent):
    PROVIDERS: ClassVar[dict] = {"openai": ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4"]}
    MODELS: ClassVar[list] = [llm for _, llms in PROVIDERS.items() for llm in llms]

    name: str
    llm: str
    token_name: str
    system_prompt: Optional[str] = Field(default=None)

    # @model_validator(mode="after")
    # def validate_model(cls, values):
    #     if values.llm not in cls.MODELS:
    #         raise ValueError(f"Model name '{values.llm}' is not valid.")
    #     return values

    # @model_validator(mode="after")
    # def validate_model_token(cls, values):
    #     llm_token_name = cls.MODEL_TO_KEY[values.llm]
    #     llm_token = os.getenv(llm_token_name)
    #     if not llm_token:
    #         raise ValueError(f"LLM token '{llm_token_name}' must be provided.")
    #     return values
