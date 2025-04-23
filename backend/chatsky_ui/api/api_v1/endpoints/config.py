from fastapi import APIRouter, HTTPException, status
from omegaconf import OmegaConf
from typing import Optional

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


@router.get("/llms/tokens")
async def get_llm_tokens():
    env_vars = settings.get_env_vars("llm")
    tokens = []
    for key, _ in env_vars.items():
        provider = key.split("_")[-1]
        key = "_".join(key.split("_")[1:-1])
        tokens.append((key, provider))
        
    return tokens


@router.post("/llms/token")
async def post_llm_token(provider: str, token_name: str, token_value: str):
    """Creates a new token for an LLM provider."""
    if provider not in LLMModel.PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider}' not found. Available providers: {', '.join(LLMModel.PROVIDERS.keys())}",
        )
    
    env_vars = settings.get_env_vars(_form_token_name(token_name, provider))
    if env_vars:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token '{token_name}' already exists. Use PATCH to update it.",
        )

    settings.add_env_vars({_form_token_name(token_name, provider): token_value})
    return {"status": "ok", "message": "Token saved successfully"}


@router.patch("/llms/token")
async def patch_llm_token(provider: str, old_token_name:str, new_token_name: Optional[str] = None, new_token_value: Optional[str] = None):
    """Updates an existing token for an LLM provider."""
    if provider not in LLMModel.PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider}' not found. Available providers: {', '.join(LLMModel.PROVIDERS.keys())}",
        )

    if new_token_name is not None:
        env_vars = settings.get_env_vars(_form_token_name(new_token_name, provider))
        if env_vars:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token '{new_token_name}' already exists. Use PATCH to update it.",
            )

    new_token_name = new_token_name or old_token_name
    new_token_value = new_token_value or settings.get_env_vars(_form_token_name(old_token_name, provider)).get(_form_token_name(old_token_name, provider))

    try:
        settings.remove_env_vars([_form_token_name(old_token_name, provider)])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token '{old_token_name}' for provider '{provider}' not found.",
        )
    settings.add_env_vars({_form_token_name(new_token_name, provider): new_token_value})

    return {"status": "ok", "message": "Token updated successfully"}


@router.delete("/llms/token")
async def delete_llm_token(provider: str, token_name: str):
    try:
        settings.remove_env_vars([_form_token_name(token_name, provider)])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token '{token_name}' for provider '{provider}' not found.",
        )
    return {"status": "ok", "message": "Token deleted successfully"}

@router.get("/llms")
async def get_llm_models():
    """Returns the list of LLM models."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)
    return {"status": "ok", "data": llms_conf}


@router.post("/llms")
async def post_llm_model(config_name: str, model_name: str, llm_token_name: str, system_prompt: str = ""):
    """Creates a new LLM model configuration."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if config_name in llms_conf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LLM model '{config_name}' already exists. Use PATCH to update it.",
        )

    if model_name not in LLMModel.MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {', '.join(LLMModel.MODELS)}",
        )

    env_vars = settings.get_env_vars(f"llm_{llm_token_name}")
    llm_token_value = next(iter(env_vars.values()), None)
    if llm_token_value is None or llm_token_value == "":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token '{llm_token_name}' doesn't exist. Please set it in the environment variables.",
        )

    llms_conf[config_name] = {
        "model_name": model_name,
        "token_name": llm_token_name,
        "system_prompt": system_prompt,
    }

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model created successfully"}


@router.patch("/llms")
async def patch_llm_model(
    old_config_name: str,
    new_config_name: str = None,
    model_name: str = None,
    llm_token_name: str = None,
    system_prompt: str = None
):
    """Updates an existing LLM model configuration."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if old_config_name not in llms_conf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LLM model '{old_config_name}' not found. Use POST to create it.",
        )

    if model_name and model_name not in LLMModel.MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {', '.join(LLMModel.MODELS)}",
        )
    
    if new_config_name:
        if new_config_name in llms_conf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"LLM model '{new_config_name}' already exists. Use PATCH to update it.",
            )
        llms_conf[new_config_name] = llms_conf.pop(old_config_name)
        config_name = new_config_name
    else:
        config_name = old_config_name

    if llm_token_name:
        env_vars = settings.get_env_vars(f"llm_{llm_token_name}")
        llm_token_value = next(iter(env_vars.values()), None)
        if llm_token_value is None or llm_token_value == "":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Token '{llm_token_name}' doesn't exist. Please set it in the environment variables.",
            )
        llms_conf[config_name]["token_name"] = llm_token_name

    if model_name:
        llms_conf[config_name]["model_name"] = model_name

    if system_prompt is not None:
        llms_conf[config_name]["system_prompt"] = system_prompt

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model updated successfully"}


@router.delete("/llms")
async def delete_llm_model(config_name: str):
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if config_name not in llms_conf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LLM model '{config_name}' not found.",
        )

    del llms_conf[config_name]
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model deleted successfully"}
