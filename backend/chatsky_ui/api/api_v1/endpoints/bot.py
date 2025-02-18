from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from httpx import AsyncClient

from chatsky_ui.api import deps
from chatsky_ui.schemas.pagination import Pagination
from chatsky_ui.schemas.preset import BuildPreset, RunPreset
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
    preset: BuildPreset,
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
    try:
        build_id = await build_manager.start(preset)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Several builds were requested in short time. Please wait a bit and try.",
        ) from e
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


@router.get("/build/stop_all", status_code=200)
async def stop_all_builds(build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, str]:
    try:
        await build_manager.stop_all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please check that service's up and running.",
        ) from e
    return {"status": "ok"}


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


@router.get("/build/is_changed", status_code=200)
async def check_graph_changes(*, build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, Any]:
    if build_manager.graph_repo_manager.is_changed():
        return {"status": "ok", "data": True}
    return {"status": "ok", "data": False}


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

    async def _get_builds_info_with_runs_info(
        build_manager: BuildManager, run_manager: RunManager, offset: int, limit: int
    ) -> List[Dict[str, Any]]:
        """Returns metadata of ``limit`` number of processes, starting from the ``offset``th process.

        Args:
            run_manager (RunManager): the run manager to use for getting all runs of this build
        """
        builds_info = await build_manager.get_full_info(offset=offset, limit=limit)
        runs_info = await run_manager.get_full_info(offset=0, limit=10**5)
        for build in builds_info:
            del build["run_ids"]
            build["runs"] = [
                {k: v for k, v in run.items() if k != "build_id"} for run in runs_info if run["build_id"] == build["id"]
            ]

        return builds_info

    builds_info = await _get_builds_info_with_runs_info(
        build_manager, run_manager, offset=pagination.offset(), limit=pagination.limit
    )
    if build_id is not None:
        return next((build for build in builds_info if build["id"] == build_id), None)
    else:
        return builds_info


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
    preset: RunPreset,
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
    try:
        run_id = await run_manager.start(build_id, preset)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Several runs were requested in short time. Please wait for 13 seconds before starting a new run.",
        ) from e
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Port conflict error. Something went wrong. Please check the logs for more details.",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

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


@router.get("/run/stop_all", status_code=200)
async def stop_all_runs(run_manager: RunManager = Depends(deps.get_run_manager)) -> Dict[str, str]:
    try:
        await run_manager.stop_all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please check that service's up and running.",
        ) from e
    return {"status": "ok"}


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
    run_id: int,
    user_message: str,
    user_id: Optional[str] = None,
    run_manager: RunManager = Depends(deps.get_run_manager),
):
    build_port = run_manager.get_port(run_id)
    if build_port is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build process of id '{run_id}' doesn't have a messenger of type 'web'. "
            "Check the build port and messenger in metadata.",
        )

    async with AsyncClient() as client:
        try:
            response = await client.post(
                f"http://localhost:{build_port}/chat",
                params={"user_id": user_id, "user_message": user_message},
            )
            return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Please check that service's up and running on the port '{build_port}'.",
            ) from e
