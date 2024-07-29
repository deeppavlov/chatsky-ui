from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse

from app.api.api_v1.api import api_router
from app.api.deps import get_index
from app.core.config import settings

index_dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    index_dict["instance"] = get_index()
    await index_dict["instance"].load()
    yield
    # Clean up and release the resources


app = FastAPI(title="DF Designer", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

root_router = APIRouter()


@root_router.get("/app/{path:path}")
async def route_static_file(path: str):
    if not settings.start_page.exists():
        return HTMLResponse(content="frontend is not built")
    file_path = settings.static_files / path.split("/")[-1]
    if file_path.suffix in (".js", ".css", ".html", ".ttf"):
        return FileResponse(file_path)
    return FileResponse(settings.static_files / "index.html")


@root_router.get("/")
async def root() -> Response:
    """Redirect '/' to index.html"""
    return RedirectResponse(url="/app")


app.include_router(root_router)
app.include_router(api_router)
