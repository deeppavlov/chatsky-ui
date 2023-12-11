import json
from pathlib import Path

import aiofiles
import pytest

from df_designer.logic import get_data, save_data


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
