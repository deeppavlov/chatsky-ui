from pathlib import Path

import uvicorn
from omegaconf import OmegaConf
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    APP: str = "app.main:app"

    work_directory: str = "."
    config_file_path: Path = Path(__file__).absolute()
    static_files: Path = config_file_path.parent.with_name("static")
    start_page: Path = static_files.joinpath("index.html")
    package_dir: Path = config_file_path.parents[3]

    host: str = "0.0.0.0"
    backend_port: int = 8000
    ui_port: int = 3000
    log_level: str = "debug"
    conf_reload: bool = True  # Enable auto-reload for development mode

    builds_path: Path = Path(f"{work_directory}/df_designer/builds.yaml")
    runs_path: Path = Path(f"{work_directory}/df_designer/runs.yaml")
    dir_logs: Path = Path(f"{work_directory}/df_designer/logs")
    frontend_flows_path: Path = Path(f"{work_directory}/df_designer/frontend_flows.yaml")

    uvicorn_config: uvicorn.Config = uvicorn.Config(
        APP, host, backend_port, log_level=log_level, reload=conf_reload, reload_dirs=[work_directory, str(package_dir)]
    )
    server: uvicorn.Server = uvicorn.Server(uvicorn_config)


settings = Settings()
