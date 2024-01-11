from pathlib import Path

from fastapi import FastAPI

app = FastAPI()


class Application(FastAPI):
    package_dir = Path(__file__).absolute()
    static_files = package_dir.with_name("static")
    start_page = static_files.joinpath("index.html")
    work_directory = "."
    path_to_save = Path(work_directory).joinpath("flows.json")

    conf_app = "df_designer.main:app"
    conf_host = "127.0.0.1"
    conf_port = 8000
    conf_log_level = "info"
    conf_reload = True


app = Application()
