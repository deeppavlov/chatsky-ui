from fastapi import APIRouter, HTTPException, status
from omegaconf import OmegaConf
from git import Repo
from git.exc import GitCommandError

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, write_conf
from app.utils.git_cmd import get_repo, commit_changes

router = APIRouter()

logger = get_logger(__name__)


@router.get("/{build_id}")
async def flows_get(build_id: str):
    repo = Repo.init(settings.frontend_flows_path.parent)
    for tag in repo.tags:
        if tag.name == str(build_id):
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Build_id {build_id} doesn't exist",
        )

    repo.git.checkout(build_id, settings.frontend_flows_path.name)

    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}


@router.post("/{build_id}")
async def flows_post(flows: dict, build_id: str) -> dict[str, str]:
    repo = get_repo(settings.frontend_flows_path.parent)
    for tag in repo.tags:
        if tag.name == str(build_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Build_id {build_id} already exists",
            )

    await write_conf(flows, settings.frontend_flows_path)
    logger.info("Flows saved to DB")

    commit_changes(repo, "Save frontend flows")
    repo.create_tag(build_id)

    logger.info("Flows saved to git with tag %s", build_id)

    return {"status": "ok"}
