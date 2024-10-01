from fastapi import APIRouter

from chatsky_ui.api.api_v1.endpoints import bot, chatsky_services, config, flows
from chatsky_ui.core.config import settings

api_router = APIRouter()

api_router.include_router(config.router, prefix="/".join([settings.API_V1_STR, "config"]), tags=["config"])
api_router.include_router(flows.router, prefix="/".join([settings.API_V1_STR, "flows"]), tags=["flows"])
api_router.include_router(
    chatsky_services.router, prefix="/".join([settings.API_V1_STR, "services"]), tags=["services"]
)
api_router.include_router(bot.router, prefix="/".join([settings.API_V1_STR, "bot"]), tags=["bot"])
