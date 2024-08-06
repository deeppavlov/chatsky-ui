from fastapi import APIRouter

from dflowd import __version__

router = APIRouter()


@router.get("/version")
async def get_version():
    return __version__
