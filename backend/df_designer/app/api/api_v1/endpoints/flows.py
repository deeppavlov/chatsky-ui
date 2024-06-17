from fastapi import APIRouter
from omegaconf import OmegaConf
from typing import Any

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, write_conf

router = APIRouter()

logger = get_logger(__name__)


@router.get("/")
async def flows_get() -> dict[str, Any]:
    """Get the flows by reading the frontend_flows.yaml file."""
    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}


@router.post("/")
async def flows_post(flows: dict) -> dict[str, str]:
    """Write the flows to the frontend_flows.yaml file."""
    await write_conf(flows, settings.frontend_flows_path)
    return {"status": "ok"}
