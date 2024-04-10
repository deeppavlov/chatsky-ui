from fastapi import APIRouter

from app.api.api_v1.endpoints import bot, flows
from app.core.config import settings

api_router = APIRouter()

api_router.include_router(flows.router, prefix="/".join([settings.API_V1_STR, "flows"]), tags=["flows"])
api_router.include_router(bot.router, prefix="/".join([settings.API_V1_STR, "bot"]), tags=["bot"])
