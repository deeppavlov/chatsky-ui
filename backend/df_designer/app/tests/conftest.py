# pylint: disable=C0413
# flake8: noqa: E402

from contextlib import asynccontextmanager
from typing import Generator

import httpx
import nest_asyncio
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

nest_asyncio.apply = lambda: None

from app.main import app
from app.schemas.pagination import Pagination
from app.schemas.preset import Preset
from app.services.process import RunProcess
from app.services.process_manager import BuildManager, RunManager
from app.services.websocket_manager import WebSocketManager

DUMMY_BUILD_ID = -1


async def start_process(async_client: AsyncClient, endpoint, preset_end_status) -> httpx.Response:
    return await async_client.post(
        endpoint,
        json={"wait_time": 0.1, "end_status": preset_end_status},
    )


@asynccontextmanager
async def override_dependency(mocker_obj, get_manager_func):
    process_manager = get_manager_func()
    process_manager.check_status = mocker_obj.AsyncMock()
    app.dependency_overrides[get_manager_func] = lambda: process_manager
    try:
        yield process_manager
    finally:
        for _, process in process_manager.processes.items():
            if process.process.returncode is None:
                await process.stop()
        app.dependency_overrides = {}


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
def run_process():
    async def _run_process(cmd_to_run):
        process = RunProcess(id_=0, build_id=DUMMY_BUILD_ID)
        await process.start(cmd_to_run)
        return process

    return _run_process


@pytest.fixture()
def run_manager():
    return RunManager()


@pytest.fixture()
def build_manager():
    return BuildManager()


@pytest.fixture
def websocket_manager():
    return WebSocketManager()
