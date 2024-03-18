import asyncio
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketException, status

from app.schemas.preset import Preset
from app.core.logger_config import get_logger
from app.clients.process_manager import ProcessManager
from app.api import deps
from app.clients.websocket_manager import WebSocketManager


router = APIRouter()

logger = get_logger(__name__)


def _stop_process(
    pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager), process= "run"
):
    if pid not in process_manager.processes:
        raise HTTPException(status_code=404, detail="Process not found. It may have already exited.")
    process_manager.stop(pid)
    logger.info("%s process '%s' has stopped", process.capitalize(), pid)
    return {"status": "ok"}


def _check_process_status(pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    if pid not in process_manager.processes:
        raise HTTPException(status_code=404, detail="Process not found. It may have already exited.")
    process_status = process_manager.check_status(pid)
    return {"status": process_status}


@router.post("/build/start", status_code=201)
async def start_build(preset: Preset, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    await process_manager.start(f"dflowd build_bot --preset {preset.body}")
    pid = process_manager.get_last_id()
    logger.info("Build process '%s' has started", pid)
    return {"status": "ok", "pid": pid}


@router.get("/build/stop/{pid}", status_code=200)
async def stop_build(*, pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    return _stop_process(pid, process_manager, process="build")


@router.get("/build/status/{pid}", status_code=200)
async def check_build_status(*, pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    return _check_process_status(pid, process_manager)


@router.post("/run/start")
async def start_run(preset: Preset, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    await process_manager.start(f"dflowd run_bot --preset {preset.body}")
    pid = process_manager.get_last_id()
    logger.info("Run process '%s' has started", pid)
    return {"status": "ok", "pid": pid}


@router.get("/run/stop/{pid}", status_code=200)
async def stop_run(*, pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    return _stop_process(pid, process_manager, process="run")


@router.get("/run/status/{pid}", status_code=200)
async def check_run_status(*, pid: int, process_manager: ProcessManager = Depends(deps.get_process_manager)):
    return _check_process_status(pid, process_manager)


@router.get("/runs/status", status_code=200)
async def check_all_processes(process_manager: ProcessManager = Depends(deps.get_process_manager)):
    statuses = {}
    all_processes = process_manager.get_all()
    for pid, _ in all_processes.items():
        statuses[pid] = process_manager.check_status(pid)
    return statuses


@router.websocket("/run/connect")
async def connect(
    websocket: WebSocket,
    websocket_manager: WebSocketManager = Depends(deps.get_websocket_manager),
    process_manager: ProcessManager = Depends(deps.get_process_manager),
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
    if pid not in process_manager.processes:
        logger.error("process with pid '%s' exited or never existed", pid)
        raise WebSocketException(code=status.WS_1014_BAD_GATEWAY)


    await websocket_manager.connect(websocket)
    logger.info("Websocket for run process '%s' has been opened", pid)

    output_task = asyncio.create_task(websocket_manager.send_process_output_to_websocket(pid, process_manager, websocket))
    input_task = asyncio.create_task(websocket_manager.forward_websocket_messages_to_process(pid, process_manager, websocket))

    # Wait for either task to finish
    _, websocket_manager.pending_tasks[websocket] = await asyncio.wait(
        [output_task, input_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
