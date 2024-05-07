from fastapi import APIRouter, Depends

from app.api.deps import get_index
from app.core.logger_config import get_logger
from app.services.index import Index

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)):
    response = await index.search_service(service_name)
    return response


@router.get("/refresh_index", status_code=200)
async def refresh_index(index: Index = Depends(get_index)):
    await index.load()
    return {"status": "ok"}
