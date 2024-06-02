from fastapi import APIRouter
from omegaconf import OmegaConf
from git import Repo
from git.exc import GitCommandError

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, write_conf
from app.utils.git_cmd import get_repo, commit_changes

router = APIRouter()

logger = get_logger(__name__)


@router.get("/{tag}")
async def flows_get(tag: str):
    bot_repo = Repo.init(settings.frontend_flows_path.parent)
    bot_repo.git.checkout(tag, settings.frontend_flows_path.name)

    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}


@router.post("/{tag}")
async def flows_post(flows: dict, tag: str) -> dict[str, str]:
    await write_conf(flows, settings.frontend_flows_path)
    logger.info("Flows saved to DB")

    repo = get_repo(settings.frontend_flows_path.parent)
    commit_changes(repo, "Save frontend flows")
    repo.create_tag(tag)

    logger.info("Flows saved to git with tag %s", tag)

    return {"status": "ok"}
