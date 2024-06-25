from typing import Optional

from fastapi import APIRouter, Depends

from app.api.deps import get_index
from app.clients.dff_client import get_dff_conditions
from app.core.logger_config import get_logger
from app.services.index import Index

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)) -> dict[str, str | Optional[list]]:
    """Searches for a custom service by name and returns its code.

    A service could be a condition, reponse, or pre/postservice.
    """
    response = await index.search_service(service_name)
    return {"status": "ok", "data": response}


@router.get("/get_conditions", status_code=200)
async def get_conditions() -> dict[str, str | list]:
    """Gets the dff's out-of-the-box conditions."""
    return {"status": "ok", "data": get_dff_conditions()}
