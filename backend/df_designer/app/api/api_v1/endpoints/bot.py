import asyncio
from typing import Optional, Union

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, WebSocket, WebSocketException, status

from app.api import deps
from app.core.logger_config import get_logger
from app.schemas.pagination import Pagination
from app.schemas.preset import Preset
from app.services.process_manager import BuildManager, ProcessManager, RunManager
from app.services.websocket_manager import WebSocketManager

router = APIRouter()

logger = get_logger(__name__)


async def _stop_process(id_: int, process_manager: ProcessManager, process="run"):
    try:
        await process_manager.stop(id_)
    except (RuntimeError, ProcessLookupError) as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited or not started yet. Please check logs.",
        ) from e

    logger.info("%s process '%s' has stopped", process.capitalize(), id_)
    return {"status": "ok"}


def _check_process_status(id_: int, process_manager: ProcessManager) -> dict[str, str]:
    if id_ not in process_manager.processes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited.",
        )
    process_status = process_manager.get_status(id_)
    return {"status": process_status}


@router.post("/build/start", status_code=201)
async def start_build(
    preset: Preset, background_tasks: BackgroundTasks, build_manager: BuildManager = Depends(deps.get_build_manager)
):
    await asyncio.sleep(preset.wait_time)
    await build_manager.start(preset)
    build_id = build_manager.get_last_id()
    background_tasks.add_task(build_manager.check_status, build_id)
    logger.info("Build process '%s' has started", build_id)
    return {"status": "ok", "build_id": build_id}


@router.get("/build/stop/{build_id}", status_code=200)
async def stop_build(*, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)):
    return await _stop_process(build_id, build_manager, process="build")


@router.get("/build/status/{build_id}", status_code=200)
async def check_build_status(*, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)):
    return _check_process_status(build_id, build_manager)


@router.get("/builds", response_model=Optional[Union[list, dict]], status_code=200)
async def check_build_processes(
    build_id: Optional[int] = None,
    build_manager: BuildManager = Depends(deps.get_build_manager),
    pagination: Pagination = Depends(),
):
    if build_id is not None:
        return await build_manager.get_build_info(build_id)
    else:
        return await build_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)


@router.get("/builds/logs/{build_id}", response_model=Optional[list], status_code=200)
async def get_build_logs(
    build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager), pagination: Pagination = Depends()
):
    if build_id is not None:
        return await build_manager.fetch_build_logs(build_id, pagination.offset(), pagination.limit)


@router.post("/run/start/{build_id}", status_code=201)
async def start_run(
    *,
    build_id: int,
    preset: Preset,
    background_tasks: BackgroundTasks,
    run_manager: RunManager = Depends(deps.get_run_manager)
):
    await asyncio.sleep(preset.wait_time)
    await run_manager.start(build_id, preset)
    run_id = run_manager.get_last_id()
    background_tasks.add_task(run_manager.check_status, run_id)
    logger.info("Run process '%s' has started", run_id)
    return {"status": "ok", "run_id": run_id}


@router.get("/run/stop/{run_id}", status_code=200)
async def stop_run(*, run_id: int, run_manager: RunManager = Depends(deps.get_run_manager)):
    return await _stop_process(run_id, run_manager, process="run")


@router.get("/run/status/{run_id}", status_code=200)
async def check_run_status(*, run_id: int, run_manager: RunManager = Depends(deps.get_run_manager)):
    return _check_process_status(run_id, run_manager)


@router.get("/runs", response_model=Optional[Union[list, dict]], status_code=200)
async def check_run_processes(
    run_id: Optional[int] = None,
    run_manager: RunManager = Depends(deps.get_run_manager),
    pagination: Pagination = Depends(),
):
    if run_id is not None:
        return await run_manager.get_run_info(run_id)
    else:
        return await run_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)


@router.get("/runs/logs/{run_id}", response_model=Optional[list], status_code=200)
async def get_run_logs(
    run_id: int, run_manager: RunManager = Depends(deps.get_run_manager), pagination: Pagination = Depends()
):
    if run_id is not None:
        return await run_manager.fetch_run_logs(run_id, pagination.offset(), pagination.limit)


@router.websocket("/run/connect")
async def connect(
    websocket: WebSocket,
    websocket_manager: WebSocketManager = Depends(deps.get_websocket_manager),
    run_manager: RunManager = Depends(deps.get_run_manager),
):
    """Establish a WebSocket connection to communicate with an active bot identified by its 'run_id'.
    The WebSocket URL should adhere to the format: /bot/run/connect?run_id=<run_id>.
    """
    logger.debug("Connecting to websocket")
    run_id = websocket.query_params.get("run_id")

    # Validate run_id
    if run_id is None:
        logger.error("No run_id provided")
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    if not run_id.isdigit():
        logger.error("A non-digit run run_id provided")
        raise WebSocketException(code=status.WS_1003_UNSUPPORTED_DATA)
    run_id = int(run_id)
    if run_id not in run_manager.processes:
        logger.error("process with run_id '%s' exited or never existed", run_id)
        raise WebSocketException(code=status.WS_1014_BAD_GATEWAY)

    await websocket_manager.connect(websocket)
    logger.info("Websocket for run process '%s' has been opened", run_id)

    await websocket.send_text("Start chatting")

    output_task = asyncio.create_task(
        websocket_manager.send_process_output_to_websocket(run_id, run_manager, websocket)
    )
    input_task = asyncio.create_task(
        websocket_manager.forward_websocket_messages_to_process(run_id, run_manager, websocket)
    )

    # Wait for either task to finish
    _, websocket_manager.pending_tasks[websocket] = await asyncio.wait(
        [output_task, input_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
    websocket_manager.disconnect(websocket)
