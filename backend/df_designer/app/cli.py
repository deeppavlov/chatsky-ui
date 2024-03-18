import asyncio
import json
import os
import subprocess
import typer

from app.core.config import settings
from app.core.logger_config import get_logger

logger = get_logger(__name__)

cli = typer.Typer()

@cli.command("build_bot")
def build_bot(
    project_dir: str = settings.WORK_DIRECTORY,
    preset: str = "success"
):
    presets_build_path = os.path.join(project_dir, "df_designer", "presets", "build.json")
    with open(presets_build_path) as file:
        presets_build_file = json.load(file)

    if preset in presets_build_file:
        command_to_run = presets_build_file[preset]["cmd"]
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        process = subprocess.run(command_to_run, shell=True, check=False)
        if process.returncode > 0:
            logger.error(
                "Execution of command `%s` was unsuccessful. Exited with code '%s'",
                command_to_run,
                process.returncode,
            )
            # TODO: inform ui
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("run_bot")
def run_bot(
    project_dir: str = settings.WORK_DIRECTORY,
    preset: str = "success"
):
    presets_run_path = os.path.join(project_dir, "df_designer", "presets", "run.json")
    with open(presets_run_path) as file:
        presets_run_file = json.load(file)

    if preset in presets_run_file:
        command_to_run = presets_run_file[preset]["cmd"]
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        process = subprocess.run(command_to_run, shell=True, check=False)
        if process.returncode > 0:
            logger.error(
                "Execution of command `%s` was unsuccessful. Exited with code '%s'",
                command_to_run,
                process.returncode,
            )
            # TODO: inform ui
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_run_file.keys())}")


@cli.command("run_scenario")
def run_scenario(
    project_dir: str = "."
):
    process = subprocess.run(f"poetry run python {project_dir}/app.py", shell=True, check=False)
    if process.returncode > 0:
        logger.error(
            "Execution of command `python app.py` was unsuccessful. Exited with code '%s'",
            process.returncode,
        )
        # TODO: inform ui


#### TODO: move to DB DIR
# def setup_database(project_dir: str) -> None:
#     """Set up the database."""
#     engine = create_engine(f"sqlite:///{project_dir}/{app.database_file}")
#     Base.metadata.create_all(engine)


def _setup_backend(ip_address: str, port: int, conf_reload: str, project_dir: str) -> None:
    settings.WORK_DIRECTORY = project_dir # TODO: set a function for setting the value
    # setup_database(project_dir)
    settings.setup_server(ip_address, port, conf_reload, project_dir)


async def _run_server() -> None:
    """Run the server."""
    await settings.server.run()


@cli.command("run_backend")
def run_backend(
    ip_address: str = settings.HOST,
    port: int = settings.BACKEND_PORT,
    conf_reload: str = str(settings.CONF_RELOAD),
    project_dir: str = settings.WORK_DIRECTORY,
) -> None:
    """Run the backend."""
    _setup_backend(ip_address, port, conf_reload, project_dir)
    settings.server.run()
