import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from omegaconf import DictConfig, OmegaConf

load_dotenv()


class Settings:
    def __init__(self):
        self.API_V1_STR = "/api/v1"
        self.APP = "chatsky_ui.main:app"

        self.config_file_path = Path(__file__).absolute()
        self.static_files = self.config_file_path.parent.with_name("static")
        self.start_page = self.static_files / "index.html"
        self.package_dir = self.config_file_path.parents[2]

        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
        self.log_level = os.getenv("LOG_LEVEL", "info")

        self.conf_reload = os.getenv("CONF_RELOAD", "false").lower() in ["true", "1", "t", "y", "yes"]

        config = self._load_temp_config()
        self.work_directory = Path(config.work_directory)
        self._set_user_proj_paths()

    def set_config(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

        if "work_directory" in kwargs:
            self._set_user_proj_paths()

    def _set_user_proj_paths(self):
        self.builds_path = self.work_directory / "df_designer/builds.yaml"
        self.runs_path = self.work_directory / "df_designer/runs.yaml"
        self.dir_logs = self.work_directory / "df_designer/logs"
        self.frontend_flows_path = self.work_directory / "df_designer/frontend_flows.yaml"
        self.index_path = self.work_directory / "bot/custom/.services_index.yaml"
        self.snippet2lint_path = self.work_directory / "bot/custom/.snippet2lint.py"
        self.scripts_dir = self.work_directory / "bot/scripts"
        self.presets = self.work_directory / "df_designer/presets"

    def save_config(self):
        OmegaConf.save(
            OmegaConf.create({"work_directory": str(self.work_directory)}),  # type: ignore
            self.config_file_path.with_name("temp_conf.yaml"),
        )

    def _load_temp_config(self) -> DictConfig:
        return OmegaConf.load(self.config_file_path.with_name("temp_conf.yaml"))  # type: ignore

    def refresh_work_dir(self):
        config = self._load_temp_config()
        self.work_directory = Path(config.work_directory)
        self._set_user_proj_paths()


class AppRunner:
    def __init__(self):
        self._settings = None

    @property
    def settings(self):
        if self._settings is None:
            raise ValueError("Settings has not been configured. Call set_logger() first.")
        return self._settings

    def set_settings(self, app_settings: Settings):
        self._settings = app_settings

    def run(self):
        if reload := self.settings.conf_reload:
            reload_conf = {
                "reload": reload,
                "reload_dirs": [str(self.settings.package_dir)],
                "reload_excludes": [
                    f"./{self.settings.work_directory}/*",
                    f"./{self.settings.work_directory}/*/*",
                    f"./{self.settings.work_directory}/*/*/*",
                ],
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
app_runner = AppRunner()
