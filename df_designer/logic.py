import json
import os
from typing import Any

import aiofiles
from fastapi import Request
from pydantic import Json

from df_designer.settings import path_to_save


async def save_data(request: Request):
    """Save the json config."""
    result = await request.json()
    async with aiofiles.open(path_to_save, "w", encoding="utf-8") as file:
        await file.write(json.dumps(result))


async def get_data() -> Json[Any]:
    """Get the json config."""
    if os.path.exists(path_to_save):
        async with aiofiles.open(path_to_save, "r", encoding="utf-8") as file:
            return json.loads(await file.read())
    else:
        return {}
