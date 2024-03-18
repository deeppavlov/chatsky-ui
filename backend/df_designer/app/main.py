from fastapi import FastAPI, APIRouter
import uvicorn

from app.api.api_v1.api import api_router

app = FastAPI(title="DF Designer")

root_router = APIRouter()


@root_router.get("/", status_code=200)
def root() -> dict:
    """
    Root GET
    """
    return {"msg": "Frontend is not build yet"}


app.include_router(root_router)
app.include_router(api_router)


if __name__ == "__main__": #TODO: is this needed? as we already have the run_backend command in cli
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="debug")
