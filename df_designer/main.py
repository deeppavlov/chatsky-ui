import dff
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from df_designer.logic import get_data, save_data

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# TODO: добавить версию v1
# TODO: заглушка для dff
# TODO: тесты дописать


@app.get("/")
async def main_page() -> HTMLResponse:
    """Main."""
    html = "main page"
    return HTMLResponse(content=html, status_code=200)


@app.get("/alive")
async def alive() -> dict[str, str]:
    """Is alive service."""
    return {"status": "ok"}


@app.post("/save")
async def save(request: Request):
    """Save data."""
    await save_data(request)
    return {"status": "ok"}


@app.get("/get")
async def get():
    """Get data."""
    result = await get_data()
    return result


################################################################
# new methods
################################################################


# /projects
@app.get("/projects")
async def projects_get() -> dict[str, str]:
    """(get projects from db) - returns JSON of all saved projects"""
    return {"status": "ok"}


@app.post("/projects")
async def projects_post() -> dict[str, str]:
    """(add new project) - receives JSON of new project"""
    return {"status": "ok"}


@app.patch("/projects")
async def projects_patch() -> dict[str, str]:
    """(edit all projects list) - receives JSON of edited projects"""
    return {"status": "ok"}


@app.delete("/projects")
async def projects_delete() -> dict[str, str]:
    """@delete (delete project) - receives projectID by query param"""
    return {"status": "ok"}


@app.post("/projects/upload")
async def projects_upload_post() -> dict[str, str]:
    """upload"""
    return {"status": "ok"}


@app.get("/projects/download")
async def projects_download_get() -> dict[str, str]:
    """upload"""
    return {"status": "ok"}


# /service
@app.get("/service/health")
async def service_health_get() -> dict[str, str]:
    """(get health status from server)"""
    return {"status": "ok"}


@app.get("/service/version")
async def service_version_get() -> dict[str, str]:
    """(get dff curr version)"""
    version = dff.__version__
    return {"status": "ok", "version": version}


# /library
@app.get("/library/functions")
async def library_functions_get() -> dict[str, str]:
    """(get base functions) - ?? JSON"""
    return {"status": "ok"}


@app.get("/library/llms")
async def library_llms_get() -> dict[str, str]:
    """(get available llm models) - JSON of llm models"""
    return {"status": "ok"}


# /dff
@app.post("/dff/tests/prompt")
async def dff_tests_prompt_post() -> dict[str, str]:
    """(get response by user prompt) - receives user prompt, returns dff response"""
    return {"status": "ok"}


@app.post("/dff/tests/condition")
async def dff_tests_condition_post() -> dict[str, str]:
    """(test condition by user prompt) - receive user prompt, returns dff response ?and condition status"""
    return {"status": "ok"}


# /build
@app.post("/build")
async def build_post() -> dict[str, str]:
    """(send flag to compile and connect user's bot ??)"""
    return {"status": "ok"}


"""
/git ??

/git/stars @get ??
/git/forks @get ??
"""
