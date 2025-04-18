from fastapi import APIRouter, HTTPException, status
from omegaconf import OmegaConf
import os
from dotenv import load_dotenv
from chatsky_ui import __version__
from chatsky_ui.core.config import settings
from chatsky_ui.schemas.front_graph_components.llm_model import LLMModel
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.core.logger_config import get_logger  # noqa: E402

router = APIRouter()


def _form_token_name(token_name: str, provider: str) -> str:
    """Forms the token name for the given provider and token name."""
    return "_".join(["llm", token_name, provider])


@router.get("/version")
async def get_version():
    """Returns current Chatsky-UI version using importlib.metadata"""
    return __version__


@router.get("/providers")
async def get_providers():
    """Returns available LLM providers"""
    return LLMModel.PROVIDERS


@router.post("/llms/token")
async def post_llm_token(provider: str, token_name: str, token_value: str):
    if provider not in LLMModel.PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider}' not found. Available providers: {', '.join(LLMModel.PROVIDERS.keys())}",
        )
    settings.add_env_vars({_form_token_name(token_name, provider): token_value})
    return {"status": "ok", "message": "Token saved successfully"}


@router.get("/llms/tokens")
async def get_llm_tokens():
    env_vars = settings.get_env_vars("llm")
    return [
        (key.split("_")[1], "_".join(key.split("_")[2:]))
        for key, _ in env_vars.items()
    ]


@router.delete("/llms/token")
async def delete_llm_token(provider: str, token_name: str):
    env_vars = settings.get_env_vars("llm")
    for key in env_vars.keys():
        if key == _form_token_name(token_name, provider):
            if env_vars[key] == "":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Token '{token_name}' for provider '{provider}' is already empty.",
                )
            settings.add_env_vars({key: ""})
            return {"status": "ok", "message": "Token deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Token '{token_name}' for provider '{provider}' not found.",
    )


@router.post("/llms")
async def post_llm_model(config_name: str, model_name: str, llm_token_name: str, system_prompt: str = None):
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if model_name not in LLMModel.MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {', '.join(LLMModel.MODELS)}",
        )
    print(config_name, model_name, llm_token_name, system_prompt)
    load_dotenv()
    env_vars = settings.get_env_vars(f"llm_{llm_token_name}")
    print(env_vars)
    llm_token_value = next(iter(env_vars.values()), None)
    print(llm_token_value)
    if llm_token_value is None or llm_token_value == "":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token '{llm_token_name}' is empty. Please set it in the environment variables.",
        )
    logger = get_logger(__name__)
    if config_name in llms_conf:
        logger.info("Updating existing LLM model configuration: {config_name}")
    else:
        logger.info("Creating new LLM model configuration: {config_name}")
    print(llms_conf)
    llms_conf.update({
        config_name: {
            "model_name": model_name,
            "token_name": llm_token_name,
            "system_prompt": system_prompt,
        }
    })

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model saved successfully"}
