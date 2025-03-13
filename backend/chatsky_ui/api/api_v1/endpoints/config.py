from fastapi import APIRouter

from chatsky_ui import __version__

router = APIRouter()


@router.get("/version")
async def get_version():
    """Returns current Chatsky-UI version using importlib.metadata"""
    return __version__
