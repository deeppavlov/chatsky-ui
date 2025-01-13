import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

from chatsky_ui.main import app


@pytest.mark.asyncio
async def test_search_service():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        get_response = await async_client.get("/api/v1/services/search/condition/HelloCnd")
        assert get_response.status_code == 200
        data = get_response.json()["data"]
        assert data


@pytest.mark.asyncio
async def test_get_conditions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        get_response = await async_client.get("/api/v1/services/get_conditions")
        assert get_response.status_code == 200
        data = get_response.json()["data"]
        assert data
