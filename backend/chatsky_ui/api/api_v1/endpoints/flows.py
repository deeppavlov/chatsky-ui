from typing import Dict, Union

from fastapi import APIRouter
from omegaconf import OmegaConf

from chatsky_ui.core.config import settings
from chatsky_ui.db.base import read_conf, write_conf

router = APIRouter()


@router.get("/")
async def flows_get() -> Dict[str, Union[str, Dict[str, list]]]:
    """Get the flows by reading the frontend_flows.yaml file."""
    omega_flows = await read_conf(settings.frontend_flows_path)
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)
    return {"status": "ok", "data": dict_flows}  # type: ignore


@router.post("/")
async def flows_post(flows: Dict[str, list]) -> Dict[str, str]:
    """Write the flows to the frontend_flows.yaml file."""
    await write_conf(flows, settings.frontend_flows_path)
    return {"status": "ok"}
