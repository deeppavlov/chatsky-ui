from pathlib import Path
from typing import Dict, Optional, Union

from dotenv import set_key
from fastapi import APIRouter, Depends, HTTPException, status
from git.exc import GitCommandError
from omegaconf import OmegaConf

from chatsky_ui.api.deps import get_build_manager
from chatsky_ui.core.config import settings
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.services.process_manager import BuildManager

router = APIRouter()


def _save_token(key: str, token: str) -> Dict[str, str]:
    dotenv_path = Path(settings.work_directory) / ".env"
    dotenv_path.touch(exist_ok=True)

    set_key(dotenv_path, key, token)
    return {"status": "ok", "message": "Token saved successfully"}


@router.get("/")
async def flows_get(
    build_id: Optional[int] = None, build_manager: BuildManager = Depends(get_build_manager)
) -> Dict[str, Union[str, Dict[str, Union[list, dict]]]]:
    """Get the flows by reading the frontend_flows.yaml file."""
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

    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}  # type: ignore


@router.post("/")
async def flows_post(
    flows: Dict[str, Union[list, dict]], build_manager: BuildManager = Depends(get_build_manager)
) -> Dict[str, str]:
    """Write the flows to the frontend_flows.yaml file."""

    tags = sorted(build_manager.graph_repo_manager.repo.tags, key=lambda t: t.commit.committed_datetime)
    build_manager.graph_repo_manager.checkout_tag(tags[-1], settings.frontend_flows_path.name)

    await write_conf(flows, settings.frontend_flows_path)

    return {"status": "ok"}


@router.post("/tg_token")
async def post_tg_token(token: str):
    _save_token("TG_BOT_TOKEN", token)

@router.post("/chatgpt_token")
async def post_chatgpt_token(token: str):
    _save_token("CHATGPT_API_KEY", token)
