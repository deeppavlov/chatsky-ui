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
        self.temp_conf = self.config_file_path.with_name("temp_conf.yaml")

        self.set_config(
            host=os.getenv("HOST", "0.0.0.0"),
            port=os.getenv("PORT", "8000"),
            log_level=os.getenv("LOG_LEVEL", "info"),
            conf_reload=os.getenv("CONF_RELOAD", "false"),
            work_directory=".",
        )

    def set_config(self, **kwargs):
        for key, value in kwargs.items():
            if key == "work_directory":
                value = Path(value)
            elif key == "conf_reload":
                value = str(value).lower() in ["true", "yes", "t", "y", "1"]
            elif key == "port":
                value = int(value)
            setattr(self, key, value)

        if "work_directory" in kwargs:
            self._set_user_proj_paths()

    def _set_user_proj_paths(self):
        self.builds_path = self.work_directory / "chatsky_ui/app_data/builds.yaml"
        self.runs_path = self.work_directory / "chatsky_ui/app_data/runs.yaml"
        self.frontend_flows_path = self.work_directory / "chatsky_ui/app_data/frontend_flows.yaml"
        self.dir_logs = self.work_directory / "chatsky_ui/logs"
        self.presets = self.work_directory / "chatsky_ui/presets"
        self.snippet2lint_path = self.work_directory / "chatsky_ui/.snippet2lint.py"

        self.custom_dir = self.work_directory / "bot/custom"
        self.index_path = self.custom_dir / ".services_index.yaml"
        self.conditions_path = self.custom_dir / "conditions.py"
        self.responses_path = self.custom_dir / "responses.py"
        self.scripts_dir = self.work_directory / "bot/scripts"

    def save_config(self):
        if not self.temp_conf.exists():
            self.temp_conf.touch()
        OmegaConf.save(
            OmegaConf.create(
                {
                    "work_directory": str(self.work_directory),
                    "host": self.host,
                    "port": self.port,
                    "log_level": self.log_level,
                    "conf_reload": self.conf_reload,
                }
            ),  # type: ignore
            self.temp_conf,
        )

    def _load_temp_config(self) -> DictConfig:
        if not self.temp_conf.exists():
            raise FileNotFoundError(f"{self.temp_conf} not found.")

        return OmegaConf.load(self.temp_conf)  # type: ignore

    def refresh_work_dir(self):
        config = self._load_temp_config()
        self.set_config(**config)


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
