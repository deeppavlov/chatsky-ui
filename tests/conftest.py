from pathlib import Path
import pytest


@pytest.fixture(scope="session", autouse=True)
def test_folder():
    """create a folder"""
    print("]---starting test---[")
    Path("test_directory").mkdir()
    yield
    Path("test_directory").rmdir()
    print("]---ending test---[")


@pytest.fixture
def test_file_path():
    return Path("/tmp").joinpath("test.json")
