import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    APP: str = "app.main:app"

    work_directory: str = "."
    config_file_path: Path = Path(__file__).absolute()
    static_files: Path = config_file_path.parent.with_name("static")
    start_page: Path = static_files.joinpath("index.html")
    package_dir: Path = config_file_path.parents[3]
    pyproject_path: Path = package_dir / "df_designer" / "pyproject.toml"

    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    log_level: str = os.getenv("LOG_LEVEL", "info")
    conf_reload: bool = os.getenv("CONF_RELOAD", "true").lower() in ["true", "1", "t", "y", "yes"]

    builds_path: Path = Path(f"{work_directory}/df_designer/builds.yaml")
    runs_path: Path = Path(f"{work_directory}/df_designer/runs.yaml")
    dir_logs: Path = Path(f"{work_directory}/df_designer/logs")
    frontend_flows_path: Path = Path(f"{work_directory}/df_designer/frontend_flows.yaml")
    index_path: Path = Path(f"{work_directory}/bot/custom/.services_index.yaml")
    snippet2lint_path: Path = Path(f"{work_directory}/bot/custom/.snippet2lint.py")


class AppRunner:
    def __init__(self, settings: Settings):
        self.settings = settings

    def run(self):
        if reload := self.settings.conf_reload:
            reload_conf = {
                "reload": reload,
                "reload_dirs": [self.settings.work_directory, str(self.settings.package_dir)],
            }
        else:
            reload_conf = {"reload": reload}

        uvicorn.run(
            self.settings.APP,
            host=self.settings.host,
            port=self.settings.port,
            log_level=self.settings.log_level,
            **reload_conf,
        )


settings = Settings()
app_runner = AppRunner(settings)
