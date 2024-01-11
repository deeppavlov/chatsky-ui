import json
import os
from pathlib import Path
from typing import Any

import aiofiles
from pydantic import Json


async def save_data(path: Path, data: dict[str, str]):
    """Save the json config."""
    async with aiofiles.open(path, "w", encoding="utf-8") as file:
        await file.write(json.dumps(data))


async def get_data(path: Path) -> Json[Any]:
    """Get the json config."""
    if os.path.exists(path):
        async with aiofiles.open(path, "r", encoding="utf-8") as file:
            return json.loads(await file.read())
    else:
        return {}
