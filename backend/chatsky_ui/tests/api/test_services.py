def test_search_service(client):
    get_response = client.get("/api/v1/services/search/condition/HelloCnd")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert data


def test_get_conditions(client):
    get_response = client.get("/api/v1/services/get_conditions")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert data
