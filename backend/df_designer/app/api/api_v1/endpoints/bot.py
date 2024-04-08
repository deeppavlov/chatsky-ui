import asyncio
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketException, status, BackgroundTasks
from typing import Optional, Union

from app.schemas.preset import Preset
from app.schemas.pagination import Pagination
from app.core.logger_config import get_logger
from app.services.process_manager import ProcessManager, BuildManager, RunManager
from app.api import deps
from app.services.websocket_manager import WebSocketManager


router = APIRouter()

logger = get_logger(__name__)


async def _stop_process(
    pid: int, process_manager: ProcessManager, process= "run"
):
    if pid not in process_manager.processes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process not found. It may have already exited."
        )
    await process_manager.stop(pid)
    logger.info("%s process '%s' has stopped", process.capitalize(), pid)
    return {"status": "ok"}


def _check_process_status(pid: int, process_manager: ProcessManager) -> dict[str, str]:
    if pid not in process_manager.processes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process not found. It may have already exited.",
        )
    process_status = process_manager.get_status(pid)
    return {"status": process_status}


@router.post("/build/start", status_code=201)
async def start_build(preset: Preset, background_tasks: BackgroundTasks, build_manager: BuildManager = Depends(deps.get_build_manager)):
    await asyncio.sleep(preset.wait_time)
    await build_manager.start(preset)
    build_id = build_manager.get_last_id()
    background_tasks.add_task(build_manager.check_status, build_id)
    logger.info("Build process '%s' has started", build_id)
    return {"status": "ok", "build_id": build_id}


@router.get("/build/stop/{build_id}", status_code=200)
async def stop_build(*, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)):
    return await _stop_process(build_id, build_manager, process="build")


@router.get("/build/status/{pid}", status_code=200)
async def check_build_status(*, pid: int, build_manager: BuildManager = Depends(deps.get_build_manager)):
    return _check_process_status(pid, build_manager)


@router.get("/builds", response_model=Optional[Union[list, dict]], status_code=200)
async def check_build_processes(
    build_id: Optional[int] = None,
    build_manager: BuildManager = Depends(deps.get_build_manager),
    pagination: Pagination = Depends()
):
    if build_id is not None:
        return build_manager.get_build_info(build_id)
    else:
        return build_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)

@router.get("/builds/logs/{build_id}", response_model=Optional[list], status_code=200)
async def get_build_logs(
    build_id: int,
    build_manager: BuildManager = Depends(deps.get_build_manager),
    pagination: Pagination = Depends()
):
    if build_id is not None:
        return await build_manager.fetch_build_logs(build_id, pagination.offset(), pagination.limit)


@router.post("/run/start/{build_id}", status_code=201)
async def start_run(*, build_id: int, preset: Preset, background_tasks: BackgroundTasks, run_manager: RunManager = Depends(deps.get_run_manager)):
    await asyncio.sleep(preset.wait_time)
    await run_manager.start(build_id, preset)
    run_id = run_manager.get_last_id()
    background_tasks.add_task(run_manager.check_status, run_id)
    logger.info("Run process '%s' has started", run_id)
    return {"status": "ok", "run_id": run_id}


@router.get("/run/stop/{pid}", status_code=200)
async def stop_run(*, pid: int, run_manager: RunManager = Depends(deps.get_run_manager)):
    return await _stop_process(pid, run_manager, process="run")


@router.get("/run/status/{pid}", status_code=200)
async def check_run_status(*, pid: int, run_manager: RunManager = Depends(deps.get_run_manager)):
    return _check_process_status(pid, run_manager)


@router.get("/runs", response_model=Optional[Union[list, dict]], status_code=200)
async def check_run_processes(
    run_id: Optional[int] = None,
    run_manager: RunManager = Depends(deps.get_run_manager),
    pagination: Pagination = Depends()
):
    if run_id is not None:
        return run_manager.get_run_info(run_id)
    else:
        return run_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)


@router.get("/runs/logs/{run_id}", response_model=Optional[list], status_code=200)
async def get_run_logs(
    run_id: int,
    run_manager: RunManager = Depends(deps.get_run_manager),
    pagination: Pagination = Depends()
):
    if run_id is not None:
        return await run_manager.fetch_run_logs(run_id, pagination.offset(), pagination.limit)


@router.websocket("/run/connect")
async def connect(
    websocket: WebSocket,
    websocket_manager: WebSocketManager = Depends(deps.get_websocket_manager),
    run_manager: RunManager = Depends(deps.get_run_manager),
):
    """Open a websocket to connect to a running bot, whose id is 'pid'.
    Websocket url should be of format: `/bot/run/connect?pid=<pid>`
    """
    logger.debug("Connecting to websocket")
    pid = websocket.query_params.get("pid")

    # Validate pid
    if pid is None:
        logger.error("No run pid provided")
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    if not pid.isdigit():
        logger.error("A non-digit run pid provided")
        raise WebSocketException(code=status.WS_1003_UNSUPPORTED_DATA)
    pid = int(pid)
    if pid not in run_manager.processes:
        logger.error("process with pid '%s' exited or never existed", pid)
        raise WebSocketException(code=status.WS_1014_BAD_GATEWAY)


    await websocket_manager.connect(websocket)
    logger.info("Websocket for run process '%s' has been opened", pid)

    output_task = asyncio.create_task(websocket_manager.send_process_output_to_websocket(pid, run_manager, websocket))
    input_task = asyncio.create_task(websocket_manager.forward_websocket_messages_to_process(pid, run_manager, websocket))

    # Wait for either task to finish
    _, websocket_manager.pending_tasks[websocket] = await asyncio.wait(
        [output_task, input_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
    websocket_manager.disconnect(websocket)
