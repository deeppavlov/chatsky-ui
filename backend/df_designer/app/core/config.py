from pydantic_settings import BaseSettings
from pathlib import Path
from omegaconf import OmegaConf
import uvicorn

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    WORK_DIRECTORY: str = "."

    # consult about the namings
    APP: str = "app.main:app"
    package_dir: Path = Path(__file__).absolute()
    static_files: Path = package_dir.parent.with_name("static")
    HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    UI_PORT: int = 3000
    LOG_LEVEL: str = "debug"
    CONF_RELOAD: bool = True # Enable auto-reload for development mode
    BUILDS_PATH: Path = Path(f"{WORK_DIRECTORY}/df_designer/builds.yaml")
    RUNS_PATH: Path = Path(f"{WORK_DIRECTORY}/df_designer/runs.yaml")
    DIR_LOGS: Path = Path(f"{WORK_DIRECTORY}/df_designer/logs")
    FRONTEND_FLOWS_PATH : Path = Path(f"{WORK_DIRECTORY}/df_designer/frontend_flows.yaml")
    # database_file = "database.sqlite"
    server: uvicorn.Server = uvicorn.Server(
        uvicorn.Config(APP, HOST, BACKEND_PORT, LOG_LEVEL, CONF_RELOAD, reload_dirs=WORK_DIRECTORY)
    )
    
    def setup_server(self, ip_address: str, port: int, conf_reload: str, project_dir: str) -> None:
        config = uvicorn.Config(
            app=self.APP,
            host=ip_address,
            port=port,
            log_level=self.LOG_LEVEL,
            reload=conf_reload.lower() in ["true", "yes", "t", "y", "1"],
            reload_dirs=project_dir
        )
        self.server = uvicorn.Server(config)
    
    def read_conf(self, path: Path):
        return OmegaConf.load(path)

settings = Settings()
