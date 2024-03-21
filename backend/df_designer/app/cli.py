from cookiecutter.main import cookiecutter
import json
import os
import subprocess
import sys
import typer

from app.core.config import settings
from app.core.logger_config import get_logger

logger = get_logger(__name__)

cli = typer.Typer()


def _execute_command(command_to_run):
    try:
        process = subprocess.run(
            command_to_run.split(),
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5
        )

        if process.stdout:
            logger.info("Command '%s' output: %s", command_to_run, process.stdout)
        if process.stderr:
            logger.error("Command '%s' error: %s", command_to_run, process.stderr)

        # Check the return code to determine success
        if process.returncode == 0:
            logger.info("Command '%s' executed successfully.", command_to_run)
        else:
            logger.error("Command '%s' failed with return code: %d", command_to_run, process.returncode)
            sys.exit(process.returncode)

    except subprocess.TimeoutExpired as e:
        logger.error("Command '%s' timed out with no error: %s", command_to_run, str(e))
    except Exception as e:
        logger.error("Error executing '%s': %s", command_to_run, str(e))
        sys.exit(1)


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

        _execute_command(command_to_run)
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

        _execute_command(command_to_run)
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_run_file.keys())}")


@cli.command("run_scenario")
def run_scenario(
    project_dir: str = "."
):
    command_to_run = f"poetry run python {project_dir}/app.py"
    _execute_command(command_to_run)


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


@cli.command("init")
def init(destination: str = settings.WORK_DIRECTORY):
    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        cookiecutter("https://github.com/Ramimashkouk/df_d_template.git")
    finally:
        os.chdir(original_dir)
