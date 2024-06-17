from fastapi import APIRouter, Depends

from app.api.deps import get_index
from app.core.logger_config import get_logger
from app.services.index import Index
from app.clients.dff_client import get_dff_objects

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)):
    response = await index.search_service(service_name)
    return response


@router.get("/get_conditions", status_code=200)
async def get_all_services():
    native_services = get_dff_objects()
    native_conditions = [k.split(".")[-1] for k, _ in native_services.items() if k.startswith("dff.cnd.")]

    return native_conditions
