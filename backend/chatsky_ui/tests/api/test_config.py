from chatsky_ui import __version__

def test_get_version(client):
    response = client.get("/api/v1/config/version")
    assert response.status_code == 200
    assert response.json() == __version__
