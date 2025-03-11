import signal
import threading
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse

from chatsky_ui import __version__
from chatsky_ui.api.api_v1.api import api_router
from chatsky_ui.api.deps import run_manager
from chatsky_ui.core.config import settings


def signal_handler(self, signum):
    """Gracefully shuts down Chatsky-UI in case of receiving Ctrl+C signal."""
    for process in run_manager.processes.values():
        process.to_be_terminated = True
    if signum == signal.SIGINT:
        print("Caught SIGINT termination signal, shutting down gracefully...")
        settings.temp_conf.unlink(missing_ok=True)
    elif signum == signal.SIGTERM:
        print("Caught SIGTERM termination signal, shutting down gracefully and restarting Chatsky-UI...")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.temp_conf.exists():
        settings.refresh_work_dir()
    if threading.current_thread() is threading.main_thread():
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    yield

    run_manager.set_logger()
    await run_manager.stop_all()


app = FastAPI(title="Chatsky UI", version=__version__, lifespan=lifespan)


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
