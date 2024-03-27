from fastapi import APIRouter

from app.api.api_v1.endpoints import bot, flows


api_router = APIRouter()

api_router.include_router(flows.router, prefix="/flows", tags=["flows"])
api_router.include_router(bot.router, prefix="/bot", tags=["bot"])
