from typing import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.pagination import Pagination
from app.schemas.preset import Preset
from app.services.process import RunProcess
from app.services.process_manager import BuildManager, RunManager
from app.services.websocket_manager import WebSocketManager


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
        process = RunProcess(id_=0)
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
