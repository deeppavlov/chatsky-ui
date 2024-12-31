import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

from chatsky_ui.main import app


@pytest.mark.asyncio
async def test_flows(dummy_build_id):  # noqa: F811
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True
    ) as async_client:
        get_response = await async_client.get("/api/v1/flows", params={"build_id": dummy_build_id})
        print("gettttt", get_response)
        assert get_response.status_code == 200
        data = get_response.json()["data"]
        assert "flows" in data

        response = await async_client.post("/api/v1/flows", json=data)
        assert response.status_code == 200
