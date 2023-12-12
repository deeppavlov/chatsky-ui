from pathlib import Path

from fastapi.testclient import TestClient

from df_designer import settings
from df_designer.main import app

client = TestClient(app)


def test_main_main_page():
    response = client.get("/")
    assert response.status_code == 200


def test_main_alive():
    response = client.get("/alive")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_main_save():
    response = client.post("/save", json={"key": "value"})
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_main_get():
    response = client.get("/get")
    assert response.status_code == 200
    # assert response.json() == {"status": "true"} # make mock request


def test_projects_get():
    response = client.get("/projects")
    assert response.status_code == 200


def test_projects_post():
    response = client.post("/projects")
    assert response.status_code == 200


def test_projects_patch():
    response = client.patch("/projects")
    assert response.status_code == 200


def test_projects_delete():
    response = client.delete("/projects")
    assert response.status_code == 200


def test_projects_upload_post():
    response = client.post("/projects/upload")
    assert response.status_code == 200


def test_projects_download_get():
    response = client.get("/projects/download")
    assert response.status_code == 200


def test_settings():
    assert settings.app == "df_designer.main:app"
    assert settings.host == "127.0.0.1"
    assert settings.port == 8000
    assert settings.log_level == "info"
    assert settings.reload is True
    assert settings.path_to_save == Path().home().joinpath("data.json")
