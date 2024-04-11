import asyncio
from cookiecutter.main import cookiecutter
import json
import os
from pathlib import Path
import subprocess
import sys
import typer
import uvicorn

from app.core.config import settings
from app.core.logger_config import get_logger
from app.services.json_translator import translator

cli = typer.Typer()


def _execute_command(command_to_run):
    logger = get_logger(__name__)
    try:
        process = subprocess.run(command_to_run.split(),check=False)

        # Check the return code to determine success
        if process.returncode == 0:
            logger.info("Command '%s' executed successfully.", command_to_run)
        else:
            logger.error("Command '%s' failed with return code: %d", command_to_run, process.returncode)
            sys.exit(process.returncode)

    except Exception as e:
        logger.error("Error executing '%s': %s", command_to_run, str(e))
        sys.exit(1)


def _execute_command_file(build_id: int, project_dir: str, command_file: str, preset: str):
    logger = get_logger(__name__)
    presets_build_path = os.path.join(project_dir, "df_designer", "presets", command_file)
    with open(presets_build_path) as file:
        presets_build_file = json.load(file)

    if preset in presets_build_file:
        command_to_run = presets_build_file[preset]["cmd"]
        if preset == "success":
            command_to_run += f" {build_id}"
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        _execute_command(command_to_run)
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("build_bot")
def build_bot(
    build_id: int,
    project_dir: str = settings.work_directory,
    preset: str = "success"
):
    _execute_command_file(build_id, project_dir, "build.json", preset)


@cli.command("build_scenario")
def build_scenario(build_id: int, project_dir: str = "."):
    asyncio.run(translator(build_id=build_id, project_dir=project_dir))

@cli.command("run_bot")
def run_bot(
    build_id: int,
    project_dir: str = settings.work_directory,
    preset: str = "success"
):
    _execute_command_file(build_id, project_dir, "run.json", preset)


@cli.command("run_scenario")
def run_scenario(
    build_id: int,
    project_dir: str = "."
):
    script_path = Path(project_dir) / "bot" / "scripts" / f"build_{build_id}.yaml"
    command_to_run = f"poetry run python {project_dir}/app.py --script-path {script_path}"
    _execute_command(command_to_run)


async def _run_server() -> None:
    """Run the server."""
    await settings.server.run()


@cli.command("run_backend")
def run_backend(
    ip_address: str = settings.host,
    port: int = settings.backend_port,
    conf_reload: str = str(settings.conf_reload),
    project_dir: str = settings.work_directory,
) -> None:
    """Run the backend."""
    settings.host = ip_address
    settings.backend_port = port
    settings.conf_reload = conf_reload.lower() in ["true", "yes", "t", "y", "1"]
    settings.work_directory = project_dir
    settings.uvicorn_config = uvicorn.Config(
        settings.APP,
        settings.host,
        settings.backend_port,
        reload=settings.conf_reload,
        reload_dirs=str(settings.work_directory)
    )
    settings.server = uvicorn.Server(settings.uvicorn_config)
    settings.server.run()


@cli.command("init")
def init(destination: str = settings.work_directory):
    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        cookiecutter("https://github.com/Ramimashkouk/df_d_template.git")
    finally:
        os.chdir(original_dir)
