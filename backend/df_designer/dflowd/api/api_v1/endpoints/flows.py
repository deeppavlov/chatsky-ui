from fastapi import APIRouter
from omegaconf import OmegaConf

from dflowd.core.config import settings
from dflowd.core.logger_config import get_logger
from dflowd.db.base import read_conf, write_conf

router = APIRouter()

logger = get_logger(__name__)


@router.get("/")
async def flows_get() -> dict[str, str | dict[str, list]]:
    """Get the flows by reading the frontend_flows.yaml file."""
    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}  # type: ignore


@router.post("/")
async def flows_post(flows: dict[str, list]) -> dict[str, str]:
    """Write the flows to the frontend_flows.yaml file."""
    await write_conf(flows, settings.frontend_flows_path)
    return {"status": "ok"}
