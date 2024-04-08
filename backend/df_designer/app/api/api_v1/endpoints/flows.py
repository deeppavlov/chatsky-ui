from fastapi import APIRouter
from omegaconf import OmegaConf

from app.core.logger_config import get_logger
from app.core.config import settings
from app.db.base import write_conf, read_conf

router = APIRouter()

logger = get_logger(__name__)


@router.get("/")
async def flows_get():
    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}


@router.post("/")
async def flows_post(flows: dict) -> dict[str, str]:
    await write_conf(flows, settings.frontend_flows_path)
    return {"status": "ok"}
