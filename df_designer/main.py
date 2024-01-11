import aiofiles
import dff
from fastapi import Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from df_designer.logic import get_data, save_data
from df_designer.settings import app

app.mount(
    "/static",
    StaticFiles(directory=app.static_files),
    name="static",
)
# TODO: добавить версию v1
# TODO: заглушка для dff
# TODO: тесты дописать


@app.get("/")
async def main_page() -> HTMLResponse:
    """Return frontend."""
    if not app.start_page.exists():
        html = "frontend is not build"
    else:
        async with aiofiles.open(app.start_page) as file:
            html = await file.read()
    return HTMLResponse(content=html, status_code=200)


# TODO: исключить самодеятельность
@app.get("/assets/{asset}")
async def static_assets(asset: str):
    return RedirectResponse("/static/assets/" + asset)
# TODO: исключить самодеятельность


# /flows
@app.get("/flows")
async def flows_get():
    """(get flows from db) - returns JSON of all saved flows"""
    result = await get_data(app.path_to_save)
    return {"status": "ok", "data": result}


@app.post("/flows")
async def flows_post(request: Request) -> dict[str, str]:
    """(add new flows) - receives JSON of new flows"""
    data = await request.json()
    await save_data(path=app.path_to_save, data=data)
    return {"status": "ok"}


@app.patch("/flows")
async def flows_patch() -> dict[str, str]:
    """(edit all flows list) - receives JSON of edited flows"""
    return {"status": "ok"}


@app.delete("/flows")
async def flows_delete() -> dict[str, str]:
    """@delete (delete flows) - receives flowsID by query param"""
    return {"status": "ok"}


@app.post("/flows/upload")
async def flows_upload_post() -> dict[str, str]:
    """upload"""
    return {"status": "ok"}


@app.get("/flows/download")
async def flows_download_get() -> dict[str, str]:
    """upload"""
    return {"status": "ok"}


# /service
@app.get("/service/health")
async def service_health_get() -> dict[str, str]:
    """(get health status from server)"""
    return {"status": "ok"}


# TODO: команды для Максима
@app.get("/meta")
async def service_version_get() -> dict[str, str]:
    """(get dff curr version)"""
    version = dff.__version__
    return {"status": "ok", "version": version}


# TODO: здесь подгружается namespaces (funcs, vars, ...)
# TODO: подумать, может быть назвать через config vs namespaces
# /library
@app.get("/library/functions")
async def library_functions_get() -> dict[str, str]:
    """(get base functions) - ?? JSON"""
    return {"status": "ok"}


# TODO: здесь вычитывание конфигурации (не только LLM)
# TODO: нет сохранения конфигурации для моделей (API-s, API-KEY-s)
# TODO: нет сохранения общей конфигурации (hotkeys, git creds, ports, index_paths, paths to additional configs)
@app.get("/library/llms")
async def library_llms_get() -> dict[str, str]:
    """(get available llm models) - JSON of llm models"""
    return {"status": "ok"}


# TODO: rename runtime (здесь нет DFF, здесь используются модели)
# /dff
@app.post("/dff/tests/prompt")
async def dff_tests_prompt_post() -> dict[str, str]:
    """(get response by user prompt) - receives user prompt, returns dff response"""
    return {"status": "ok"}


@app.post("/dff/tests/condition")
async def dff_tests_condition_post() -> dict[str, str]:
    """(test condition by user prompt) - receive user prompt, returns dff response ?and condition status"""
    return {"status": "ok"}


# TODO: compile (сериализация в питон), build, runtime
# /build
@app.post("/build")
async def build_post() -> dict[str, str]:
    """(send flag to compile and connect user's bot ??)"""
    return {"status": "ok"}


# TODO: другие эндпоинты (git, bot)

"""
/git ??

/git/stars @get ??
/git/forks @get ??
"""
