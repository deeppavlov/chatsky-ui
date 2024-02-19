import asyncio
import copy
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Literal

import aiofiles
import dff
from pydantic import BaseModel
import starlette
from fastapi import BackgroundTasks, Request, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import insert, select, update
from websockets import ConnectionClosedOK

from df_designer import process
from df_designer.db_connection import Logs, async_session
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


@app.get("/run")
async def run():
    """get run"""
    async with async_session() as session:
        stmt = select(Logs)
        result = await session.execute(stmt)
        logs_list = result.scalars().all()

    return {"status": "ok", "logs": logs_list}


@app.get("/run/{run_id}")
async def run_file(run_id: str):
    """get run file"""
    async with async_session() as session:
        stmt = select(Logs).where(Logs.id == run_id)
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


@app.websocket("/socket")
async def run_to_websocket(websocket: WebSocket):
    print(websocket.client_state.value)
    await websocket.accept()
    print(websocket.client_state.value)

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


#######################################################
build_data: list[Any] = []


class Preset(BaseModel):
    name: str
    duration: int
    end_status: Literal["running", "completed", "failed", "null", "stopped"]


def imitation_build(id: int, duration: int, end_status: str):
    time.sleep(duration)
    if build_data[id]["status"] == "stopped":
        return
    build_data[id]["status"] = end_status


@app.post("/bot/build/start", tags=["bot build"])
async def bot_build_start(preset: Preset, background_tasks: BackgroundTasks):
    """Start a build.

    * name - build name
    * duration - seconds
    * end_status - "running", "completed", "failed", "null"
    """
    build_data.append(
        {
            "id": len(build_data),
            "timestamp": time.time(),
            "preset_name": preset.dict()["name"],
            "status": "running",
            "logs": [],
            "logs_path": "",
            "runs": [],
        }
    )
    background_tasks.add_task(
        imitation_build,
        id=build_data[-1]["id"],
        duration=preset.dict()["duration"],
        end_status=preset.dict()["end_status"],
    )
    return {"status": "ok", "build_info": build_data[-1]}


@app.get("/bot/build/status/", tags=["bot build"])
async def bot_build_status():
    """Get build status."""
    try:
        return build_data[-1]["status"]
    except IndexError:
        return {"build": "not found"}


@app.get("/bot/build/stop", tags=["bot build"])
async def bot_build_stop():
    """Build stop."""
    build_data[-1]["status"] = "stopped"
    return {"status": "ok"}


@app.get("/bot/builds", tags=["bot build"])
async def bot_builds():
    """List builds."""
    # TODO: add filtering
    build_join = copy.deepcopy(build_data)
    runs_join = copy.deepcopy(runs_data)
    for build in build_join:
        build.pop("logs")
        build.pop("logs_path")
        for run in runs_join:
            if run["build_id"] == build["id"]:
                run.pop("logs")
                run.pop("logs_path")
                build["runs"].append(run)
    return {"build": build_join}


@app.get("/bot/builds/{build_id}", tags=["bot build"])
async def bot_builds_id(build_id: int):
    """Specific builds."""
    try:
        return {"build": build_data[build_id]}
    except IndexError:
        return {"build": "not found"}


###########################################
runs_data: list[Any] = []


# dublicat
class Preset(BaseModel):
    name: str
    duration: int
    end_status: Literal["running", "completed", "failed", "null", "stopped"]


def imitation_run(id: int, duration: int, end_status: str):
    time.sleep(duration)
    if runs_data[id]["status"] == "stopped":
        return
    runs_data[id]["status"] = end_status


@app.post("/bot/run/start", tags=["bot runs"])
async def bot_runs_start(preset: Preset, background_tasks: BackgroundTasks):
    """Start a runs.

    * name - build name
    * duration - seconds
    * end_status - "running", "completed", "failed", "null"
    """
    try:
        build_id = build_data[-1]
    except IndexError:
        return {"status": "error", "run_info": "build is not found"}
    runs_data.append(
        {
            "id": len(runs_data),
            "timestamp": time.time(),
            "preset_name": preset.dict()["name"],
            "status": "running",
            "logs": [],
            "logs_path": "",
            "build_id": build_id["id"],
        }
    )
    background_tasks.add_task(
        imitation_run,
        id=runs_data[-1]["id"],
        duration=preset.dict()["duration"],
        end_status=preset.dict()["end_status"],
    )
    return {"status": "ok", "run_info": runs_data[-1]}


@app.get("/bot/run/status/", tags=["bot runs"])
async def bot_runs_status():
    """Get build runs."""
    try:
        return runs_data[-1]["status"]
    except IndexError:
        return {"run": "not found"}


@app.get("/bot/run/stop", tags=["bot runs"])
async def bot_runs_stop():
    """Runs stop."""
    runs_data[-1]["status"] = "stopped"
    return {"status": "ok"}


@app.get("/bot/runs", tags=["bot runs"])
async def bot_runs():
    """List runs."""
    # TODO: add filtering
    mini_runs_data = copy.deepcopy(runs_data)
    for run in mini_runs_data:
        run.pop("logs")
        run.pop("logs_path")
    return {"run": mini_runs_data}


@app.get("/bot/runs/{runs_id}", tags=["bot runs"])
async def bot_runs_id(runs_id: int):
    """Specific runs."""
    try:
        return {"run": runs_data[runs_id]}
    except IndexError:
        return {"run": "not found"}


# add logs
# add filtering
