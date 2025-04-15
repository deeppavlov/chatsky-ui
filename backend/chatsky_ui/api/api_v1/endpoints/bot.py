from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from httpx import AsyncClient

from chatsky_ui.api import deps
from chatsky_ui.schemas.pagination import Pagination
from chatsky_ui.schemas.preset import BuildPreset, RunPreset
from chatsky_ui.services.process_manager import BuildManager, ProcessManager, RunManager
from chatsky_ui.services.sqlite_extractor import SQLiteExtractor

router = APIRouter()


async def _stop_process(id_: int, process_manager: ProcessManager, process="run") -> Dict[str, str]:
    """Stops a `build` or `run` process with the given id.

    Args:
        id_ (int): The id of the process to stop.
        process_manager (ProcessManager): The process manager of the process with the given id.

    Raises:
        HTTPException: With status code 404 if the process with the given id is not found.

    Returns:
        {"status": "ok"}: in case of stopping a process successfully.
    """

    try:
        await process_manager.stop(id_)
    except (RuntimeError, ProcessLookupError) as e:
        process_manager.logger.error("Error stopping process '%s': %s", id_, e)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited or not started yet. Please check logs.",
        ) from e

    process_manager.logger.info("%s process '%s' has stopped", process.capitalize(), id_)
    return {"status": "ok"}


async def _check_process_status(id_: int, process_manager: ProcessManager) -> Dict[str, str]:
    """Checks the status of a `build` or `run` process with the given id.

    Args:
        id_ (int): The id of the process to check.
        process_manager (ProcessManager): The process manager of the process with the given id.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": response}: with `response` being the status of the given process.
    """
    if id_ not in process_manager.processes:
        process_manager.logger.error("Process '%s' not found", id_)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found. It may have already exited.",
        )
    process_status = await process_manager.get_status(id_)
    process_manager.logger.info("Process '%s' status: %s", id_, process_status)
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
        preset (BuildPreset): The preset to set the build process for. Must be among ("success", "failure", "loop")
        background_tasks (BackgroundTasks): A background tasks manager. Required to schedule a task that keeps checking
            the status of the build process in the background after returning a response.
        build_manager (BuildManager): The process manager dependency to start the process with.

    Returns:
        {"status": "ok", "build_id": build_id}: in case of **starting** the build process successfully.
    """
    try:
        build_manager.logger.debug("Starting build process with preset '%s'", preset)
        build_id = await build_manager.start(preset)
    except RuntimeError as e:
        build_manager.logger.error("Error starting build process: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Several builds were requested in short time. Please wait a bit and try.",
        ) from e
    background_tasks.add_task(build_manager.check_status, build_id)
    return {"status": "ok", "build_id": build_id}


@router.get("/build/stop/{build_id}", status_code=200)
async def stop_build(*, build_id: int, build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, str]:
    """Stops a `build` process with the given id.

    Args:
        build_id (int): The id of the process to stop.
        build_manager (BuildManager): The process manager dependency to stop the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "ok"}: in case of stopping a process successfully.
    """
    build_manager.logger.debug("Stopping build process '%s'", build_id)
    return await _stop_process(build_id, build_manager, process="build")


@router.get("/build/stop_all", status_code=200)
async def stop_all_builds(build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, str]:
    """
    Stop all ongoing builds.

    This endpoint stops all builds managed by the build manager.

    Args:
        build_manager (BuildManager): The build manager dependency.

    Raises:
        HTTPException: If there is an error stopping the builds,
        an HTTP 500 error is raised with a message indicating the service status.

    Returns:
        {"status": "ok"}: in case of stopping all builds successfully.
    """
    try:
        build_manager.logger.debug("Stopping all build processes")
        await build_manager.stop_all()
    except Exception as e:
        build_manager.logger.error("Error stopping all build processes: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please check that service's up and running.",
        ) from e
    build_manager.logger.info("All build processes have been stopped")
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
    build_manager.logger.debug("Checking status of build process '%s'", build_id)
    return await _check_process_status(build_id, build_manager)


@router.get("/build/is_changed", status_code=200)
async def check_graph_changes(*, build_manager: BuildManager = Depends(deps.get_build_manager)) -> Dict[str, Any]:
    """Checks if the graph was changed since last build.

    Args:
        build_manager (BuildManager): The process manager dependency to check the graph with.

    Returns:
        {"status": "ok", "data": True}: in case the graph was changed since last build.
        {"status": "ok", "data": False}: in case the graph wasn't changed.
    """
    build_manager.logger.debug("Checking if graph was changed since last build")
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
        build_id (Optional[int]): The id of the process to check. If not specified, all processes will be checked.
        build_manager (BuildManager): The `build` process manager to check the processes with.
        run_manager (RunManager): The `run` process manager to use for getting all runs of this build.
        pagination (Pagination): An object containing the offset and limit parameters for paginating results.

    Returns:
        In case `build_id` is specified, the build info for that process along with its runs info is returned.
        Otherwise, a list containing statuses of all `build` processes along with their runs info.
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

    build_manager.logger.debug("Checking all build processes metadata")
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

    Args:
        build_id (Optional[int]): The id of the process to get the logs from.
        build_manager (BuildManager): The `build` process manager containing the `build_id` process.
        pagination (Pagination): An object containing the offset and limit parameters for paginating results.
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
        preset (RunPreset): The preset to set the build process for. Must be among ("success", "failure", "loop")
        background_tasks (BackgroundTasks): A background tasks manager. Required to schedule a task that keeps checking
            the status of the run process in the background after returning a response.
        run_manager (RunManager): The `run` process manager to start the process with.

    Raises:
        HTTPException: With status code 400 if several runs were requested in a short time.
        HTTPException: With status code 409 if there is a port conflict error.
        HTTPException: With status code 400 and the internal error details if there is a value error.

    Returns:
        {"status": "ok", "run_id": run_id}: in case of **starting** the run process successfully.
    """
    try:
        run_manager.logger.debug("Starting run process with preset '%s'", preset)
        run_id = await run_manager.start(build_id, preset)
    except RuntimeError as e:
        run_manager.logger.error("Error starting run process. Several runs in short time: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Several runs were requested in short time. Please wait for 13 seconds before starting a new run.",
        ) from e
    except ConnectionError as e:
        run_manager.logger.error("Error starting run process. Port conflict: %s", e)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Port conflict error. Something went wrong. Please check the logs for more details.",
        ) from e
    except ValueError as e:
        run_manager.logger.error("Error starting run process: %s", e)
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
    run_manager.logger.debug("Stopping run process '%s'", run_id)
    return await _stop_process(run_id, run_manager, process="run")


@router.get("/run/stop_all", status_code=200)
async def stop_all_runs(run_manager: RunManager = Depends(deps.get_run_manager)) -> Dict[str, str]:
    """
    Stop all ongoing runs.

    This endpoint stops all runs managed by the run manager.

    Args:
        run_manager (RunManager): The run manager dependency.

    Raises:
        HTTPException: If there is an error stopping the runs, an HTTP 500 error is raised with
        a message indicating the service status.

    Returns:
        {"status": "ok"}: in case of stopping all runs successfully.
    """
    try:
        run_manager.logger.debug("Stopping all run processes")
        await run_manager.stop_all()
    except Exception as e:
        run_manager.logger.error("Error stopping all run processes: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please check that service's up and running.",
        ) from e
    run_manager.logger.info("All run processes have been stopped")
    return {"status": "ok"}


@router.get("/run/status/{run_id}", status_code=200)
async def check_run_status(*, run_id: int, run_manager: RunManager = Depends(deps.get_run_manager)) -> Dict[str, Any]:
    """Checks the status of a `run` process with the given id.

    Args:
        run_id (int): The id of the process to check.
        run_manager (RunManager): The process manager dependency to check the process with.

    Raises:
        HTTPException: With status code 404 if the process is not found.

    Returns:
        {"status": "alive"}: in case of a successfully run process. Now it is able to communicate.
        {"status": "running"}: in case of a still running process.
        {"status": "stopped"}: in case of a stopped process.
        {"status": "failed"}: in case of a failed-to-run process.
    """
    run_manager.logger.debug("Checking status of run process '%s'", run_id)
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
        run_manager (RunManager): The `run` process manager to check the process with.
        pagination (Pagination): An object containing the offset and limit parameters for paginating results.

    Returns:
        In case `run_id` is specified, the run info for that process is returned.
        Otherwise, a list with run info of all `run` processes is returned.
    """
    if run_id is not None:
        run_manager.logger.debug("Checking run process '%s' metadata", run_id)
        return await run_manager.get_run_info(run_id)
    else:
        run_manager.logger.debug("Checking all run processes metadata")
        return await run_manager.get_full_info(offset=pagination.offset(), limit=pagination.limit)


@router.get("/runs/logs/{run_id}", response_model=Optional[list], status_code=200)
async def get_run_logs(
    run_id: int, run_manager: RunManager = Depends(deps.get_run_manager), pagination: Pagination = Depends()
) -> Optional[List[str]]:
    """Gets the logs of a specific `run` process.

    The offset and limit parameters can be used to paginate the results.

    Args:
        run_id (Optional[int]): The id of the process to get the logs from.
        run_manager (RunManager): The `run` process manager containing the `build_id` process.
        pagination (Pagination): An object containing the offset and limit parameters for paginating results.
    """
    run_manager.logger.debug("Getting logs of run process '%s'", run_id)
    if run_id is not None:
        return await run_manager.fetch_run_logs(run_id, pagination.offset(), pagination.limit)


@router.post("/chat", status_code=201)
async def respond(
    run_id: int,
    user_message: str,
    user_id: Optional[str] = None,
    run_manager: RunManager = Depends(deps.get_run_manager),
):
    """Sends a response to "http://localhost:<BUILD-PORT>/chat".

    The BUILD-PORT is port where Chatsky is up and running. This endpoint is used to send a message to Chatsky.

    Args:
        run_id (int): The id of the process to send the message to.
        user_message (str): The message to send to Chatsky.
        user_id (Optional[str]): The id of the user sending the message. Defaults to None.
        run_manager (RunManager): The process manager dependency to send the message with.

    Raises:
        HTTPException: With status code 404 if the build process doesn't have a messenger of type 'web'.
        HTTPException: With status code 503 if the service is unavailable.
    """
    build_port = run_manager.get_port(run_id)
    if build_port is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build process of id '{run_id}' doesn't have a messenger of type 'web'. "
            "Check the build port and messenger in metadata.",
        )
    run_manager.logger.debug("Sending message to Chatsky at port '%s'", build_port)

    async with AsyncClient() as client:
        try:
            response = await client.post(
                f"http://localhost:{build_port}/chat",
                params={"user_id": user_id, "user_message": user_message},
            )
            return response.json()
        except Exception as e:
            run_manager.logger.error("Error sending message to Chatsky: %s", e)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Please check that service's up and running on the port '{build_port}'.",
            ) from e


@router.get("/chat/{run_id}/{user_id}", response_model=Optional[list], status_code=200)
async def get_chat_records(
    run_id: int,
    user_id: int,
    sqlite_extractor: SQLiteExtractor = Depends(deps.get_sqlite_extractor),
) -> Optional[List[str]]:
    """Gets the records of a user's chat from a specified run.

    Args:
        run_id (int): The id of the `Run` process.
        user_id (int): ID of the user.
        sqlite_extractor (SQLiteExtractor): The database extractor dependency to find the chat records with.

    Raises:
        HTTPException: With status code 404 if the user with the given id is not found in the database.
        HTTPException: With status code 500 if there is an Exception caught or an internal server error.
    """
    try:
        return await sqlite_extractor.fetch_chat_records(run_id, user_id)
    except IndexError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with the given id not found in the database.",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/chat/ids", response_model=Optional[list], status_code=200)
async def get_chat_ids(
    sqlite_extractor: SQLiteExtractor = Depends(deps.get_sqlite_extractor),
) -> Optional[List[str]]:
    """Gets all chat ids as they are stored in the database.

    Args:
        sqlite_extractor (SQLiteExtractor): The database extractor dependency to find the node label with.

    Raises:
        HTTPException: With status code 500 if there is an Exception caught or an internal server error.
    """
    try:
        return await sqlite_extractor.fetch_chat_ids()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/chat/delete/{run_id}/{user_id}", status_code=200)
async def delete_chat_records(
    run_id: int,
    user_id: int,
    sqlite_extractor: SQLiteExtractor = Depends(deps.get_sqlite_extractor),
) -> Dict[str, str]:
    """Deletes the records of a user's chat from a specified run.

    Args:
        run_id (int): The id of the `Run` process.
        user_id (int): ID of the user.
        sqlite_extractor (SQLiteExtractor): The database extractor dependency to delete the chat records with.

    Raises:
        HTTPException: With status code 404 if the user with the given id is not found in the database.
        HTTPException: With status code 500 if there is an Exception caught or an internal server error.

    Returns:
        {"status": "ok"}: in case of deleting the chat records successfully.
    """
    try:
        await sqlite_extractor.delete_chat_records(run_id, user_id)
    except IndexError as e:
        sqlite_extractor.logger.error("Error deleting chat records: %s", e)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with the given id not found in the database.",
        ) from e
    except Exception as e:
        sqlite_extractor.logger.error("Error deleting chat records: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    return {"status": "ok"}
