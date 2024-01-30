import asyncio
import time
from datetime import datetime
from pathlib import Path

import aiofiles
import dff
import starlette
import websockets
from fastapi import BackgroundTasks, Request, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import insert, select, update
from websockets import ConnectionClosedOK

from df_designer import process
from df_designer.db_connection import Runs, async_session
from df_designer.db_requests import run_last
from df_designer.logic import get_data, save_data
from df_designer.settings import app

app.mount(
    "/static",
    StaticFiles(directory=app.static_files),
    name="static",
)

app.mount(
    "/assets",
    StaticFiles(directory=app.static_assets),
    name="assets",
)


@app.get("/")
async def main_page() -> HTMLResponse:
    """Return frontend."""
    if not app.start_page.exists():
        html = "frontend is not build"
    else:
        async with aiofiles.open(app.start_page) as file:
            html = await file.read()
    return HTMLResponse(content=html, status_code=200)


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


@app.get("/run")
async def run():
    """get run"""
    async with async_session() as session:
        stmt = select(Runs)
        result = await session.execute(stmt)
        logs_list = result.scalars().all()

    return {"status": "ok", "logs": logs_list}


@app.get("/run/{run_id}")
async def run_file(run_id: str):
    """get run file"""
    async with async_session() as session:
        stmt = select(Runs).where(Runs.id == run_id)
        result = await session.execute(stmt)
        log = result.scalar()
    log_file = Path(log.path)
    if log_file.exists():
        async with aiofiles.open(log_file, "r", encoding="utf-8") as file:
            data = await file.read()
        return {"status": "ok", "meta": log, "data": data}
    else:
        return JSONResponse(
            status_code=404, content={"status": "error", "data": "File is not found."}
        )


@app.websocket("/socket")
async def websocket(websocket: WebSocket):
    await websocket.accept()
    cmd = app.cmd_to_run
    proc = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    file_log_name = datetime.now().strftime("%Y_%m_%d_%H_%M_%s") + ".txt"
    file_for_log = Path(app.dir_logs, file_log_name)

    async with async_session() as session:
        stmt = (
            insert(Runs)
            .values(
                datetime=time.time(),
                path=str(Path(file_for_log).absolute()),
                status="start",
            )
            .returning()
        )
        id_record = await session.execute(stmt)
        await session.commit()
    if not Path(app.dir_logs).exists():
        Path(app.dir_logs).mkdir()

    async with aiofiles.open(file_for_log, "a") as file:
        while True:
            line = await proc.stdout.readline()
            if line:
                data = line.decode("utf-8")
                await file.write(data)
                await file.flush()
                try:
                    await websocket.send_text(data)
                except ConnectionClosedOK:
                    proc.terminate()
                    async with async_session() as session:
                        stmt = (
                            update(Runs)
                            .values(status="stop")
                            .where(Runs.id == id_record.inserted_primary_key[0])
                        )
                        await session.execute(stmt)
                        await session.commit()
                    break
            else:
                break


async def task():
    while True:
        await asyncio.sleep(1)
        print("background")


@app.get("/process/start")
async def process_start(background_tasks: BackgroundTasks):
    """start a process"""
    result = await process.start()
    background_tasks.add_task(process.check_status)
    return {"status": "ok", "result": result}


@app.get("/process/status")
async def process_status():
    """status a process"""
    status = await process.status()
    return {"status": "ok", "status_process": status}


@app.get("/process/stop")
async def process_stop():
    """stop a process"""
    await process.stop()
    return {"status": "ok"}


@app.get("/process/pid")
async def process_pid():
    """pid a process"""
    pid = await process.pid()
    return {"status": "ok", "pid": pid}


@app.websocket("/run")
async def run_to_websocket(websocket: WebSocket):

    print(websocket.client_state.value)
    await websocket.accept()
    print(websocket.client_state.value)
    # import pudb

    # pu.db

    run_file = await run_last()
    print(run_file)

    async with aiofiles.open(run_file, "r", encoding="UTF-8") as file:
        # await websocket.send_text(file.read())
        while True:
            try:
                data = await asyncio.wait_for((websocket.receive_text()), 0.01)
                print(data)
            except asyncio.exceptions.TimeoutError:

                line = await file.readline()
                if not line:
                    await asyncio.sleep(1)
                else:
                    await websocket.send_text(line)

                if await process.status() is not None:
                    await websocket.close()
                    print("websocket closed")
                    break
            except starlette.websockets.WebSocketDisconnect:
                print(websocket.client_state.value)
                break
    print("== disconnected ==")
