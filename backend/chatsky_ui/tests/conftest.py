# pylint: disable=C0413
# flake8: noqa: E402

from contextlib import asynccontextmanager
from typing import Generator
import os

import httpx
import nest_asyncio
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

nest_asyncio.apply = lambda: None

from chatsky_ui.main import app
from chatsky_ui.schemas.pagination import Pagination
from chatsky_ui.schemas.preset import Preset
from chatsky_ui.services.process import BuildProcess, RunProcess
from chatsky_ui.services.process_manager import BuildManager, RunManager
from pathlib import Path


@pytest.fixture(scope="session", autouse=True)
def set_working_directory():
    project_root = Path(__file__).resolve().parents[3] / "my_project"
    os.chdir(project_root)


@pytest.fixture(scope="session")
def dummy_build_id() -> int:
    return 0


@pytest.fixture(scope="session")
def dummy_run_id() -> int:
    return 0


@pytest.fixture(scope="session")
def inexistent_id() -> int:
    return 9999


@pytest.fixture(scope="session")
def start_build_endpoint() -> str:
    return "/api/v1/bot/build/start"


@pytest.fixture(scope="session")
def stop_build_endpoint():
    def wrapper(build_id: int) -> str:
        return f"/api/v1/bot/build/stop/{build_id}"
    return wrapper


@pytest.fixture(scope="session")
def start_run_endpoint():
    def wrapper(build_id: int) -> str:
        return f"/api/v1/bot/run/start/{build_id}"
    return wrapper


@pytest.fixture(scope="session")
def stop_run_endpoint() -> str:
    return f"/api/v1/bot/run/stop"

@pytest.fixture
def override_dependency(mocker):
    @asynccontextmanager
    async def _override_dependency(get_manager_func):
        process_manager = get_manager_func()
        process_manager.check_status = mocker.AsyncMock()
        app.dependency_overrides[get_manager_func] = lambda: process_manager
        try:
            yield process_manager
        finally:
            for _, process in process_manager.processes.items():
                if process.process.returncode is None:
                    await process.stop()
            app.dependency_overrides = {}

    return _override_dependency


@pytest.fixture
def client() -> Generator:
    with TestClient(app=app) as client:
        yield client


@pytest.fixture(scope="session")
def preset() -> Preset:
    return Preset(
        wait_time=0,
        end_status="loop",
    )


@pytest.fixture
def pagination() -> Pagination:
    return Pagination()


@pytest.fixture()
def run_process(dummy_build_id, dummy_run_id):
    async def _run_process(cmd_to_run) -> RunProcess:
        process = RunProcess(id_=dummy_run_id, build_id=dummy_build_id)
        await process.start(cmd_to_run)
        return process

    return _run_process


@pytest.fixture()
def build_process(dummy_build_id):
    async def _build_process(cmd_to_run) -> BuildProcess:
        process = BuildProcess(id_=dummy_build_id)
        await process.start(cmd_to_run)
        return process

    return _build_process


@pytest.fixture()
def run_manager():
    manager = RunManager()
    manager.set_logger()
    return manager


@pytest.fixture()
def build_manager():
    return BuildManager()
