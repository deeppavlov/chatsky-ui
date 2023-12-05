from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse

from df_designer.logic import get_data, save_data

app = FastAPI()


@app.get("/")
async def main_page() -> RedirectResponse:
    """Main."""
    return RedirectResponse("/alive")


@app.get("/alive")
async def alive() -> dict[str, str]:
    """Is alive service."""
    return {"status": "true"}


@app.post("/save")
async def save(request: Request):
    """Save data."""
    await save_data(request)
    return {"status": "true"}


@app.get("/get")
async def get():
    """Get data."""
    result = await get_data()
    return result
