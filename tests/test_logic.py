import json
from pathlib import Path

import aiofiles
import pytest

from df_designer.logic import (
    get_data,
    save_data,
    log_file_name,
    create_directory_to_log,
)
from df_designer.settings import app
from datetime import datetime


@pytest.mark.asyncio
async def test_logic_save_data(test_file_path: Path):
    """Test save json."""
    await save_data(test_file_path, data={"status": "ok"})

    async with aiofiles.open(test_file_path, "r", encoding="utf-8") as file:
        assert json.loads(await file.read()) == {"status": "ok"}

    Path(test_file_path).unlink()


@pytest.mark.asyncio
async def test_logic_get_data(test_file_path: Path):
    """Test read json."""
    async with aiofiles.open(test_file_path, "w", encoding="utf-8") as file:
        await file.write(json.dumps({"status": "ok"}))

    assert await get_data(test_file_path) == {"status": "ok"}

    Path(test_file_path).unlink()


@pytest.mark.asyncio
async def test_logic_get_data_empty(test_file_path: Path):
    """Test return if no file."""
    assert await get_data(test_file_path) == {}


def test_log_file_name():
    """test name to log file"""
    file_log_name = datetime.now().strftime("%Y_%m_%d_%H_%M_%s") + ".txt"
    assert log_file_name() == Path(app.dir_logs, file_log_name)


def test_create_directory_to_log(test_directory_path):
    """Test creating a directory"""
    app.dir_logs = str(Path(test_directory_path, app.dir_logs))
    create_directory_to_log()
    assert Path(app.dir_logs).exists()
    Path(app.dir_logs).rmdir()
    app.dir_logs = "logs"
