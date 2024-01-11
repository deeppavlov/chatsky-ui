from pathlib import Path
from fastapi.testclient import TestClient

from df_designer.main import app

client = TestClient(app)
# client.app.path_to_save = "/tmp/flows.json"


def test_main_main_page():
    response = client.get("/")
    assert response.status_code == 200


def test_flows_get():
    response = client.get("/flows")
    assert response.status_code == 200


def test_flows_post():
    client.app.path_to_save = "/tmp/flows.json"
    response = client.post("/flows", json={"key": "value"})
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    Path(client.app.path_to_save).unlink()


def test_flows_patch():
    response = client.patch("/flows")
    assert response.status_code == 200


def test_flows_delete():
    response = client.delete("/flows")
    assert response.status_code == 200


def test_flows_upload_post():
    response = client.post("/flows/upload")
    assert response.status_code == 200


def test_flows_download_get():
    response = client.get("/flows/download")
    assert response.status_code == 200


def test_service_health_get():
    response = client.get("/service/health")
    assert response.status_code == 200


def test_service_version_get():
    response = client.get("/meta")
    assert response.status_code == 200


def test_library_functions_get():
    response = client.get("/library/functions")
    assert response.status_code == 200


def test_library_llms_get():
    response = client.get("/library/llms")
    assert response.status_code == 200


def test_dff_tests_prompt_get():
    response = client.post("/dff/tests/prompt")
    assert response.status_code == 200


def test_dff_tests_condition_get():
    response = client.post("/dff/tests/condition")
    assert response.status_code == 200


def test_build_get():
    response = client.post("/build")
    assert response.status_code == 200


def test_settings():
    assert app.conf_app == "df_designer.main:app"
    assert app.conf_host == "127.0.0.1"
    assert app.conf_port == 8000
    assert app.conf_log_level == "info"
    assert app.conf_reload is True


# def test_settings_path_to_save():
#     assert app.path_to_save == Path(app.work_directory).joinpath("flows.json")
