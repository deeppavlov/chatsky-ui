import aiofiles
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(title="DF Designer")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory=settings.static_files),
    name="static",
)

root_router = APIRouter()


@root_router.get("/home", include_in_schema=False, status_code=200)
async def root() -> dict:
    """Return frontend."""
    if not settings.start_page.exists():
        html = "frontend is not build"
    else:
        async with aiofiles.open(settings.start_page, mode="r") as file:
            html = await file.read()
    return HTMLResponse(content=html)

app.include_router(root_router)
app.include_router(api_router)


if __name__ == "__main__": #TODO: is this needed? as we already have the run_backend command in cli
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="debug")
