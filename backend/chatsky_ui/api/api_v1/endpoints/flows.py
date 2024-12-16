from pathlib import Path
from typing import Dict, Optional, Union

from dotenv import set_key
from fastapi import APIRouter, HTTPException, status
from git.exc import GitCommandError
from omegaconf import OmegaConf

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.utils.git_cmd import commit_changes, get_repo

router = APIRouter()


@router.get("/")
async def flows_get(build_id: Optional[int] = None) -> Dict[str, Union[str, Dict[str, Union[list, dict]]]]:
    """Get the flows by reading the frontend_flows.yaml file."""
    repo = get_repo(settings.frontend_flows_path.parent)

    if build_id is not None:
        tag = int(build_id)
        try:
            repo.git.checkout(tag, settings.frontend_flows_path.name)
        except GitCommandError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Build_id {tag} not found",
            ) from e
    else:
        try:
            repo.git.checkout("HEAD", settings.frontend_flows_path.name)
        except GitCommandError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to checkout the latest commit",
            ) from e

    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}  # type: ignore


@router.post("/")
async def flows_post(flows: Dict[str, Union[list, dict]]) -> Dict[str, str]:
    """Write the flows to the frontend_flows.yaml file."""
    logger = get_logger(__name__)
    repo = get_repo(settings.frontend_flows_path.parent)

    tags = sorted(repo.tags, key=lambda t: t.commit.committed_datetime)
    repo.git.checkout(tags[-1], settings.frontend_flows_path.name)

    await write_conf(flows, settings.frontend_flows_path)
    logger.info("Flows saved to DB")

    commit_changes(repo, "Save frontend flows")

    return {"status": "ok"}


@router.post("/tg_token")
async def post_tg_token(token: str):
    dotenv_path = Path(settings.work_directory) / ".env"
    dotenv_path.touch(exist_ok=True)

    set_key(dotenv_path, "TG_BOT_TOKEN", token)
    return {"status": "ok", "message": "Token saved successfully"}
