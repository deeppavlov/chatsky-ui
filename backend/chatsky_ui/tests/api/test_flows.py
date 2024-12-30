# create test flows function here
import pytest
from omegaconf import OmegaConf

from chatsky_ui.api.api_v1.endpoints.flows import flows_get, flows_post


# Test flows endpoints and interaction with db (read and write conf)
def test_flows(client, dummy_build_id):  # noqa: F811
    get_response = client.get("/api/v1/flows", params={"build_id": dummy_build_id})
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert "flows" in data

    response = client.post("/api/v1/flows", json=data)
    assert response.status_code == 200
