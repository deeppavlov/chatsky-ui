# create test flows function here
import pytest
from omegaconf import OmegaConf

from app.api.api_v1.endpoints.flows import flows_get, flows_post


@pytest.mark.asyncio
async def test_flows_get(mocker):
    mocker.patch("app.api.api_v1.endpoints.flows.read_conf", return_value=OmegaConf.create({"foo": "bar"}))
    response = await flows_get()
    assert response["status"] == "ok"
    assert response["data"] == {"foo": "bar"}


@pytest.mark.asyncio
async def test_flows_post(mocker):
    mocker.patch("app.api.api_v1.endpoints.flows.write_conf", return_value={})
    response = await flows_post({"foo": "bar"})
    assert response["status"] == "ok"
