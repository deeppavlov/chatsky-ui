import os
from typing import Dict, Optional, Union

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from git.exc import GitCommandError
from omegaconf import OmegaConf

from chatsky_ui.api.deps import get_build_manager
from chatsky_ui.core.config import settings
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.services.process_manager import BuildManager

router = APIRouter()


@router.get("/")
async def flows_get(
    build_id: Optional[int] = None, build_manager: BuildManager = Depends(get_build_manager)
) -> Dict[str, Union[str, Dict[str, Union[list, dict]]]]:
    """Gets the flows by reading the frontend_flows.yaml file. If the build_id isn't passed
    then it will return the last saved (committed) flow.

    Args:
        build_id (Optional[int]): The id of the process to get the flows from.
        build_manager (BuildManager): The `build` process manager containing the `build_id` process.

    Returns:
        {"status": "ok", "data": dict_flows}: in case of reading the frontend_flows.yaml file successfully,
        where `data` contains the flows obtained from the file.
    """
    if build_id is not None:
        tag = int(build_id)
        try:
            build_manager.graph_repo_manager.checkout_tag(tag, settings.frontend_flows_path.name)
        except GitCommandError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Build_id {tag} not found",
            ) from e
    else:
        try:
            build_manager.graph_repo_manager.checkout_tag("HEAD", settings.frontend_flows_path.name)
        except GitCommandError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to checkout the latest commit",
            ) from e

    omega_flows = await read_conf(settings.frontend_flows_path, settings.frontend_flows_path_lock)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}  # type: ignore


@router.post("/")
async def flows_post(
    flows: Dict[str, Union[list, dict]], build_manager: BuildManager = Depends(get_build_manager)
) -> Dict[str, str]:
    """Writes the flows to the frontend_flows.yaml file. Then commit changes to git without a tag.

    Args:
        flows (dict): The flows to write into the frontend_flows.yaml file.
        build_manager (BuildManager): The `build` process manager used in the current context.

    Returns:
        {"status": "ok"}: in case of writing the flows into the file successfully.
    """

    tags = sorted(build_manager.graph_repo_manager.repo.tags, key=lambda t: t.commit.committed_datetime)
    build_manager.graph_repo_manager.checkout_tag(tags[-1], settings.frontend_flows_path.name)

    await write_conf(flows, settings.frontend_flows_path, settings.frontend_flows_path_lock)
    build_manager.graph_repo_manager.commit_changes("Save frontend flows")

    return {"status": "ok"}


@router.post("/tg_token")
async def post_tg_token(tokens: Dict[str, str]) -> Dict[str, str]:
    """Writes the `tokens` dictionary pairs into the .env file for later use.

    Args:
        tokens (dict): Tokens to write in the format {"token_name": "token_value"}.

    Returns:
        {"status": "ok"}: in case of writing the tokens into the file successfully.
    """
    sanitized_tokens = {f"TG_{key.replace(' ', '_').upper()}": value for key, value in tokens.items()}
    settings.add_env_vars(sanitized_tokens)
    return {"status": "ok", "message": "Token saved successfully"}


@router.get("/get_tg_tokens")
async def get_tg_tokens() -> list:
    """Retrieves Telegram tokens from environment variables.

    This function loads environment variables from a .env file located in the
    specified work directory. It then iterates through the environment variables
    and collects those that start with "TG_", returning them as a list of strings.

    Returns:
        list: A list of Telegram tokens extracted from environment variables.
    """
    """"""
    load_dotenv(settings.work_directory / ".env", override=True)

    tg_token = []
    for key, _ in os.environ.items():
        if key.startswith("TG_"):
            tg_token.append("_".join(key.split("_")[1:]))
    return tg_token
