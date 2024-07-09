import os
from pathlib import Path

import uvicorn
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    APP: str = "app.main:app"

    work_directory: str = "."
    config_file_path: Path = Path(__file__).absolute()
    static_files: Path = config_file_path.parent.with_name("static")
    start_page: Path = static_files.joinpath("index.html")
    package_dir: Path = config_file_path.parents[3]

    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    log_level: str = os.getenv('LOG_LEVEL', 'info')
    conf_reload: bool = os.getenv('CONF_RELOAD', 'true').lower() in ['true', '1', 't', 'y', 'yes']

    builds_path: Path = Path(f"{work_directory}/df_designer/builds.yaml")
    runs_path: Path = Path(f"{work_directory}/df_designer/runs.yaml")
    dir_logs: Path = Path(f"{work_directory}/df_designer/logs")
    frontend_flows_path: Path = Path(f"{work_directory}/df_designer/frontend_flows.yaml")
    index_path: Path = Path(f"{work_directory}/bot/custom/.services_index.yaml")
    snippet2lint_path: Path = Path(f"{work_directory}/bot/custom/.snippet2lint.py")

    uvicorn_config: uvicorn.Config = uvicorn.Config(
        APP, host, port, log_level=log_level, reload=conf_reload, reload_dirs=[work_directory, str(package_dir)]
    )
    server: uvicorn.Server = uvicorn.Server(uvicorn_config)


settings = Settings()
