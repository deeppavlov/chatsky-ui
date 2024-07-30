from fastapi import APIRouter

from app import __version__


router = APIRouter()


@router.get("/version")
async def get_version():
    return __version__
