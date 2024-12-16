import asyncio
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from httpx import AsyncClient

from chatsky_ui.api import deps
from chatsky_ui.core.config import settings
from chatsky_ui.schemas.pagination import Pagination
from chatsky_ui.schemas.preset import Preset
from chatsky_ui.services.process_manager import BuildManager, ProcessManager, RunManager

router = APIRouter()


async def _stop_process(id_: int, process_manager: ProcessManager, process="run") -> Dict[str, str]:
    """Stops a `build` or `run` process with the given id."""

    try:
        await process_manager.stop(id_)
    except (RuntimeError, ProcessLookupError) as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited or not started yet. Please check logs.",
        ) from e

    process_manager.logger.info("%s process '%s' has stopped", process.capitalize(), id_)
    return {"status": "ok"}


async def _check_process_status(id_: int, process_manager: ProcessManager) -> Dict[str, str]:
    """Checks the status of a `build` or `run` process with the given id."""
    if id_ not in process_manager.processes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited.",
        )
    process_status = await process_manager.get_status(id_)
    return {"status": process_status.value}


@router.post("/build/start", status_code=201)
async def start_build(
    preset: Preset,
    background_tasks: BackgroundTasks,
    build_manager: BuildManager = Depends(deps.get_build_manager),
) -> Dict[str, Union[str, int]]:

    """Starts a `build` process with the given preset.

    This runs a background task to check the status of the process every 2 seconds.

    Args:
        preset (Preset): The preset to set the build process for. Must be among ("success", "failure", "loop")

    Returns:
        {"status": "ok", "build_id": build_id}: in case of **starting** the build process successfully.
    """

    await asyncio.sleep(preset.wait_time)
    build_id = await build_manager.start(preset)
    background_tasks.add_task(build_manager.check_status, build_id)
    build_manager.logger.info("Build process '%s' has started", build_id)
    return {"status": "ok", "build_id": build_id}


@router.get("/build/stop/{build_id}", status_code=200)
async def stop_build(*, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, str]:
    """Stops a `build` process with the given id.

    Args:
        build_id (int): The id of the process to stop.
        build_id (BuildManager): The process manager dependency to stop the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "ok"}: in case of stopping a process successfully.
    """
    return await _stop_process(build_id, build_manager, process="build")


@router.get("/build/status/{build_id}", status_code=200)
async def check_build_status(
    *, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)
) -> Dict[str, str]:
    """Checks the status of a `build` process with the given id.

    Args:
        build_id (int): The id of the process to check.
        build_manager (BuildManager): The process manager dependency to check the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "completed"}: in case of a successfully completed process.
        {"status": "running"}: in case of a still running process.
        {"status": "stopped"}: in case of a stopped process.
        {"status": "failed"}: in case of a failed-to-run process.
    """
    return await _check_process_status(build_id, build_manager)


@router.get("/builds", response_model=Optional[Union[list, dict]], status_code=200)
async def check_build_processes(
    build_id: Optional[int] = None,
    build_manager: BuildManager = Depends(deps.get_build_manager),
    run_manager: RunManager = Depends(deps.get_run_manager),
    pagination: Pagination = Depends(),
) -> Optional[Union[Dict[str, Any], List[Dict[str, Any]]]]:
    """Checks the status of all `build` processes and returns them along with their runs info.

    The offset and limit parameters can be used to paginate the results.

    Args:
        build_id (Optional[int]): The id of the process to check. If not specified, all processes will be returned.
    """
    if build_id is not None:
        return await build_manager.get_build_info(build_id, run_manager)
    else:
        return await build_manager.get_full_info_with_runs_info(
            run_manager, offset=pagination.offset(), limit=pagination.limit
        )


@router.get("/builds/logs/{build_id}", response_model=Optional[list], status_code=200)
async def get_build_logs(
    build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager), pagination: Pagination = Depends()
) -> Optional[List[str]]:
    """Gets the logs of a specific `build` process.

    The offset and limit parameters can be used to paginate the results.
    """
    if build_id is not None:
        return await build_manager.fetch_build_logs(build_id, pagination.offset(), pagination.limit)


@router.post("/run/start/{build_id}", status_code=201)
async def start_run(
    *,
    build_id: int,
    preset: Preset,
    background_tasks: BackgroundTasks,
    run_manager: RunManager = Depends(deps.get_run_manager),
) -> Dict[str, Union[str, int]]:
    """Starts a `run` process with the given preset.

    This runs a background task to check the status of the process every 2 seconds.

    Args:
        build_id (int): The id of the build process to start running.
        preset (Preset): The preset to set the build process for. Must be among ("success", "failure", "loop")

    Returns:
        {"status": "ok", "build_id": run_id}: in case of **starting** the run process successfully.
    """

    await asyncio.sleep(preset.wait_time)
    run_id = await run_manager.start(build_id, preset)
    background_tasks.add_task(run_manager.check_status, run_id)
    run_manager.logger.info("Run process '%s' has started", run_id)
    return {"status": "ok", "run_id": run_id}


@router.get("/run/stop/{run_id}", status_code=200)
async def stop_run(*, run_id: int, run_manager: RunManager = Depends(deps.get_run_manager)) -> Dict[str, str]:
    """Stops a `run` process with the given id.

    Args:
        run_id (int): The id of the process to stop.
        run_manager (RunManager): The process manager dependency to stop the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "ok"}: in case of stopping a process successfully.
    """

    return await _stop_process(run_id, run_manager, process="run")


@router.get("/run/status/{run_id}", status_code=200)
async def check_run_status(*, run_id: int, run_manager: RunManager = Depends(deps.get_run_manager)) -> Dict[str, Any]:
    """Checks the status of a `run` process with the given id.

    Args:
        build_id (int): The id of the process to check.
        run_manager (RunManager): The process manager dependency to check the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "alive"}: in case of a successfully run process. Now it is able to communicate.
        {"status": "running"}: in case of a still running process.
        {"status": "stopped"}: in case of a stopped process.
        {"status": "failed"}: in case of a failed-to-run process.
    """
    return await _check_process_status(run_id, run_manager)


@router.get("/runs", response_model=Optional[Union[list, dict]], status_code=200)
async def check_run_processes(
    run_id: Optional[int] = None,
    run_manager: RunManager = Depends(deps.get_run_manager),
    pagination: Pagination = Depends(),
) -> Optional[Union[Dict[str, Any], List[Dict[str, Any]]]]:
    """Checks the status of all `run` processes and returns them.

    The offset and limit parameters can be used to paginate the results.

    Args:
        run_id (Optional[int]): The id of the process to check. If not specified, all processes will be returned.
    """

    if run_id is not None:
        return await run_manager.get_run_info(run_id)
    else:
        return await run_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)


@router.get("/runs/logs/{run_id}", response_model=Optional[list], status_code=200)
async def get_run_logs(
    run_id: int, run_manager: RunManager = Depends(deps.get_run_manager), pagination: Pagination = Depends()
) -> Optional[List[str]]:
    """Gets the logs of a specific `run` process.

    The offset and limit parameters can be used to paginate the results.
    """
    if run_id is not None:
        return await run_manager.fetch_run_logs(run_id, pagination.offset(), pagination.limit)


@router.post("/chat", status_code=201)
async def respond(
    user_id: str,
    user_message: str,
):
    async with AsyncClient() as client:
        try:
            response = await client.post(
                f"http://localhost:{settings.chatsky_port}/chat",
                params={"user_id": user_id, "user_message": user_message},
            )
            return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Please check that service's up and running on the port '{settings.chatsky_port}'.",
            ) from e
