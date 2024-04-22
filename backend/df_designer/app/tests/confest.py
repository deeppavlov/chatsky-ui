from typing import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.preset import Preset


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
