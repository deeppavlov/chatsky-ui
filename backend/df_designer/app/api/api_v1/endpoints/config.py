from fastapi import APIRouter

import toml

from app.core.config import settings


router = APIRouter()


@router.get("/version")
async def get_version():
    pyproject = toml.load(settings.pyproject_path)
    return pyproject["tool"]["poetry"]["version"]
