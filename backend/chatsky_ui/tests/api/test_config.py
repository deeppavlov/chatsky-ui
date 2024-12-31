import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

from chatsky_ui import __version__
from chatsky_ui.main import app


@pytest.mark.asyncio
async def test_get_version():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        response = await async_client.get("/api/v1/config/version")
        assert response.status_code == 200
        assert response.json() == __version__
