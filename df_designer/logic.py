import json

import aiofiles
from fastapi import Request
from df_designer.settings import path_to_save


async def save_data(request: Request):
    """Save the json config."""
    result = await request.json()
    async with aiofiles.open(path_to_save, "w", encoding="utf-8") as file:
        await file.write(json.dumps(result))


async def get_data():
    """Get the json config."""
    try:
        async with aiofiles.open(path_to_save, "r", encoding="utf-8") as file:
            result = json.loads(await file.read())
        return {"status": "true", "message": result}
    except FileNotFoundError as e:
        return {"status": "error", "message": f"{e.strerror} {e.filename}"}
