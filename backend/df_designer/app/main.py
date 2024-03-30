from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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


@root_router.get("/", status_code=200)
def root() -> dict:
    """
    Root GET
    """
    return {"msg": "Frontend is not build yet"}


app.include_router(root_router)
app.include_router(api_router)
