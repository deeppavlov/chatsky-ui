from fastapi import APIRouter, Depends

from app.api.deps import get_index
from app.core.logger_config import get_logger
from app.services.index import Index
from app.clients.dff_client import get_dff_conditions

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)):
    response = await index.search_service(service_name)
    return response


@router.get("/get_conditions", status_code=200)
async def get_conditions():
    native_conditions = get_dff_conditions()
    return native_conditions
