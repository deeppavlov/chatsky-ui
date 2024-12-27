import os
from typing import ClassVar, Optional

from dotenv import load_dotenv
from pydantic import Field, model_validator

from chatsky_ui.core.config import settings

from .base_component import BaseComponent

load_dotenv(os.path.join(settings.work_directory, ".env"), override=True)


class LLMModel(BaseComponent):
    PROVIDERS: ClassVar[dict] = {
        "openai": {
            "models": ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4"],
            "api_key": "OPENAI_API_KEY",
        },
    }

    MODEL_TO_KEY: ClassVar = {model: config["api_key"] for _, config in PROVIDERS.items() for model in config["models"]}

    name: str
    llm: str
    system_prompt: Optional[str] = Field(default=None)

    @model_validator(mode="after")
    def validate_model(cls, values):
        if values.llm not in cls.MODEL_TO_KEY:
            raise ValueError(f"Model name '{values.llm}' is not valid.")
        return values

    @model_validator(mode="after")
    def validate_model_token(cls, values):
        llm_token_name = cls.MODEL_TO_KEY[values.llm]
        llm_token = os.getenv(llm_token_name)
        if not llm_token:
            raise ValueError(f"LLM token '{llm_token_name}' must be provided.")
        return values
