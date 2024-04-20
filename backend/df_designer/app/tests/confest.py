import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from typing import Generator

from app.schemas.preset import Preset
from app.main import app


@pytest.fixture
def client() -> Generator:
    with TestClient(app) as client:
        yield client

@pytest.fixture(scope="session")
def preset() -> Preset:
    return Preset(
        wait_time=0,
        end_status="loop",
    )