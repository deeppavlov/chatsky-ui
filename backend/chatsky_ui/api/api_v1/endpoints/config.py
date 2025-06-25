import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from omegaconf import OmegaConf

from chatsky_ui import __version__
from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.schemas.front_graph_components.llm_model import LLMModel

router = APIRouter()


async def _save_token_data(token_id: str, token_name: Optional[str] = None, provider: Optional[str] = None):
    """Saves the token data to llms yaml file."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    tokens = llms_conf.get("tokens", {})

    tokens.update(
        {
            token_id: {
                "name": token_name,
                "provider": provider,
            }
        }
    )

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)

    return llms_conf


@router.get("/version")
async def get_version():
    """Returns current Chatsky-UI version using importlib.metadata"""
    return __version__


@router.get("/providers")
async def get_providers():
    """Returns available LLM providers"""
    return LLMModel.PROVIDERS


# change to return the id along with the name and the provider
@router.get("/llms/tokens")
async def get_llm_tokens():
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    tokens = llms_conf.get("tokens", {})
    return {"status": "ok", "data": tokens}


@router.post("/llms/token")
async def post_llm_token(provider: str, token_name: str, token_value: str):
    """Creates a new token for an LLM provider."""
    token_name = token_name.strip().replace(" ", "_")
    if provider not in LLMModel.PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider}' not found. Available providers: {', '.join(LLMModel.PROVIDERS.keys())}",
        )

    env_vars = settings.get_env_vars(token_name)
    if env_vars:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token '{token_name}' already exists. Please use another name.",
        )

    token_id = str(uuid.uuid4())[:8]

    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    tokens = llms_conf.get("tokens", {})

    tokens.update(
        {
            token_id: {
                "name": token_name,
                "provider": provider,
            }
        }
    )

    llms_conf["tokens"] = tokens
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    settings.add_env_vars({token_name: token_value})

    return {"status": "ok", "token_id": token_id, "message": "Token saved successfully"}


@router.patch("/llms/token")
async def patch_llm_token(
    token_id: str,
    new_token_name: Optional[str] = None,
    new_provider: Optional[str] = None,
    new_token_value: Optional[str] = None,
):
    """Updates an existing token for an LLM provider."""
    logger = get_logger(__name__)

    if not any([new_provider, new_token_value, new_token_name]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of 'provider', 'token_name', or 'token_value' must be provided.",
        )

    if new_provider is not None and new_provider not in LLMModel.PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{new_provider}' not found. Available providers: {', '.join(LLMModel.PROVIDERS.keys())}",
        )

    if new_token_name is not None:
        is_token_in_env = settings.get_env_vars(new_token_name)
        if is_token_in_env:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token '{new_token_name}' already exists. Choose another name.",
            )

    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    tokens = llms_conf.get("tokens", {})

    if token_id not in tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token ID '{token_id}' not found. Use POST to create it.",
        )

    old_token_name, old_provider = tokens[token_id]["name"], tokens[token_id]["provider"]

    token_name = new_token_name or old_token_name
    token_name = token_name.strip().replace(" ", "_")
    token_provider = new_provider or old_provider
    token_value = new_token_value or settings.get_env_vars(old_token_name).get(old_token_name)

    tokens[token_id]["name"] = token_name
    tokens[token_id]["provider"] = token_provider
    try:
        settings.remove_env_vars([old_token_name])
    except ValueError:
        logger.warning(
            f"Unexpexted behavior: Token '{old_token_name}' not found "
            f"in `.env`. Please check your environment variables."
        )
    settings.add_env_vars({token_name: token_value})

    llms_conf["tokens"] = tokens
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)

    return {"status": "ok", "message": "Token updated successfully"}


@router.delete("/llms/token")
async def delete_llm_token(id: str):
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    tokens = llms_conf.get("tokens", {})

    if id not in tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token with ID '{id}' not found.",
        )
    token_name = tokens[id]["name"]
    provider = tokens[id]["provider"]

    del tokens[id]
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)

    try:
        settings.remove_env_vars([token_name])
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
    return {"status": "ok", "data": llms_conf.get("config_models", {})}


@router.post("/llms")
async def post_llm_model(config_name: str, model_name: str, llm_token_id: str, system_prompt: str = ""):
    """Creates a new LLM model configuration."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if "config_models" not in llms_conf:
        llms_conf["config_models"] = {}

    if config_name in [model["name"] for model in llms_conf["config_models"].values()]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LLM model '{config_name}' already exists. Use PATCH to update it.",
        )

    if model_name not in LLMModel.MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {', '.join(LLMModel.MODELS)}",
        )

    if llm_token_id not in llms_conf.get("tokens", {}):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token ID '{llm_token_id}' not found. Please create it first.",
        )

    config_model_id = str(uuid.uuid4())[:8]
    llms_conf["config_models"].update(
        {
            config_model_id: {
                "name": config_name,
                "model_name": model_name,
                "token_id": llm_token_id,
                "system_prompt": system_prompt,
            }
        }
    )

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "config_id": config_model_id, "message": "LLM model created successfully"}


@router.patch("/llms")
async def patch_llm_model(
    config_id: str,
    new_config_name: str = None,
    model_name: str = None,
    llm_token_id: str = None,
    system_prompt: str = None,
):
    """Updates an existing LLM model configuration."""
    if not any([new_config_name, model_name, llm_token_id, system_prompt]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of new_config_name, model_name, llm_token_id, or system_prompt must be provided.",
        )

    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    config_models = llms_conf["config_models"]

    if config_id not in config_models:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LLM model '{config_id}' not found. Use POST to create it.",
        )

    if model_name and model_name not in LLMModel.MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {', '.join(LLMModel.MODELS)}",
        )

    if new_config_name and new_config_name in config_models:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LLM model '{new_config_name}' already exists. Use PATCH to update it.",
        )

    if llm_token_id:
        if llm_token_id not in llms_conf.get("tokens", {}):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Token '{llm_token_id}' doesn't exist. Please set it in the environment variables.",
            )

    llms_conf["config_models"].update(
        {
            config_id: {
                "name": new_config_name if new_config_name else config_models[config_id]["config_name"],
                "model_name": model_name if model_name else config_models[config_id]["model_name"],
                "token_id": llm_token_id if llm_token_id else config_models[config_id]["token_id"],
                "system_prompt": system_prompt if system_prompt else config_models[config_id]["system_prompt"],
            }
        }
    )

    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model updated successfully"}


@router.delete("/llms")
async def delete_llm_model(config_id: str):
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if config_id not in llms_conf["config_models"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LLM model '{config_id}' not found.",
        )

    del llms_conf["config_models"][config_id]
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "LLM model deleted successfully"}


@router.post("/llms/default/")
async def post_default_llm_model(config_id: str):
    """Sets the default LLM model configuration."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if config_id not in llms_conf["config_models"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LLM model '{config_id}' not found.",
        )

    llms_conf["default_model"] = config_id
    await write_conf(llms_conf, settings.llms_conf_path, settings.llms_path_lock)
    return {"status": "ok", "message": "Default LLM model set successfully"}


@router.get("/llms/default/")
async def get_default_llm_model():
    """Returns the default LLM model configuration."""
    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    default_model = llms_conf.get("default_model")
    if not default_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Default LLM model not found.",
        )

    return {"status": "ok", "data": default_model}
