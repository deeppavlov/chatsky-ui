# create test flows function here
import pytest
from app.api.api_v1.endpoints.flows import flows_get, flows_post


@pytest.mark.asyncio
async def test_flows_get():
    response = await flows_get()
    assert response["status"] == "ok"


@pytest.mark.asyncio
async def test_flows_post():
    response = await flows_post({"foo": "bar"})
    assert response["status"] == "ok"
