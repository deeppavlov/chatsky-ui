import aiofiles
from fastapi import APIRouter
from omegaconf import OmegaConf

from app.core.logger_config import get_logger
from app.core.config import settings

router = APIRouter()

logger = get_logger(__name__)


@router.get("/")
async def flows_get():
    async with aiofiles.open(settings.FRONTEND_FLOWS_PATH, "r", encoding="UTF-8") as file:
        flows = await file.read()
    omega_flows = OmegaConf.create(flows) # read from a YAML string
    dict_flows = OmegaConf.to_container(omega_flows, resolve=True)

    return {"status": "ok", "data": dict_flows}


@router.post("/")
async def flows_post(flows: dict) -> dict[str, str]:
    async with aiofiles.open(settings.FRONTEND_FLOWS_PATH, "w", encoding="UTF-8") as file:
        yaml_flows = OmegaConf.to_yaml(flows)
        await file.write(yaml_flows)
    return {"status": "ok"}
