# pylint: disable=C0413
# flake8: noqa: E402

import os
from contextlib import asynccontextmanager
from typing import Literal

import nest_asyncio
import pytest

nest_asyncio.apply = lambda: None

from pathlib import Path

from chatsky_ui.main import app
from chatsky_ui.schemas.preset import BuildPreset, RunPreset
from chatsky_ui.services.process import BuildProcess, RunProcess
from chatsky_ui.services.process_manager import BuildManager, RunManager


@pytest.fixture(scope="session", autouse=True)
def set_working_directory():
    project_root = Path(__file__).resolve().parents[3] / "my_project"
    os.chdir(project_root)


@pytest.fixture(scope="session")
def dummy_build_id() -> int:
    return 0


@pytest.fixture(scope="session")
def unique_build_token(dummy_build_id) -> str:
    return f"UNIQUE_BUILD_TOKEN_{dummy_build_id}"


@pytest.fixture(scope="session")
def dummy_build_preset():
    def wrapper(end_status: Literal["success", "failure", "loop"] = "success"):
        return BuildPreset(name="dummy_build_preset", end_status=end_status, preset="dummy", messenger="web")

    return wrapper


@pytest.fixture(scope="session")
def dummy_run_id() -> int:
    return 0


@pytest.fixture(scope="session")
def inexistent_id() -> int:
    return 9999


@pytest.fixture(scope="session")
def dummy_port() -> int:
    return 9000


@pytest.fixture(scope="session")
def dummy_token_name() -> str:
    return "MY_TOKEN"


@pytest.fixture(scope="session")
def dummy_run_preset(dummy_token_name):
    def wrapper(end_status: Literal["success", "failure", "loop"] = "success"):
        return RunPreset(
            name="dummy_run_preset",
            build_name="dummy_build",
            end_status=end_status,
            preset="dummy",
            tg_bot_token=dummy_token_name,
        )

    return wrapper


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
        process_manager.update_db_info = mocker.AsyncMock()
        app.dependency_overrides[get_manager_func] = lambda: process_manager
        try:
            yield process_manager
        finally:
            for _, process in process_manager.processes.items():
                if process.process.returncode is None:
                    await process.stop()
            app.dependency_overrides = {}

    return _override_dependency


@pytest.fixture()
def run_process(dummy_build_id, dummy_run_id, dummy_port, dummy_run_preset):
    async def _run_process(cmd_to_run) -> RunProcess:
        process = RunProcess(
            id_=dummy_run_id, build_id=dummy_build_id, messenger="telegram", port=dummy_port, preset=dummy_run_preset
        )
        await process.start(cmd_to_run)
        return process

    return _run_process


@pytest.fixture()
def build_process(dummy_build_id, dummy_port, dummy_web_preset):
    async def _build_process(cmd_to_run) -> BuildProcess:
        process = BuildProcess(id_=dummy_build_id, port=dummy_port, preset=dummy_web_preset)
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
