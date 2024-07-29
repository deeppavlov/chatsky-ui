import asyncio
import json
import os
import sys
from pathlib import Path

import toml
import nest_asyncio
import typer
from cookiecutter.main import cookiecutter

# Patch nest_asyncio before importing DFF
nest_asyncio.apply = lambda: None

from app.core.config import app_runner, settings  # noqa: E402
from app.core.logger_config import get_logger  # noqa: E402

cli = typer.Typer()


async def _execute_command(command_to_run):
    logger = get_logger(__name__)
    try:
        process = await asyncio.create_subprocess_exec(*command_to_run.split())

        # Check the return code to determine success
        if process.returncode == 0:
            logger.info("Command '%s' executed successfully.", command_to_run)
        elif process.returncode is None:
            logger.info("Process by command '%s' is running.", command_to_run)
            await process.wait()
            logger.info("Process ended with return code: %d.", process.returncode)
            sys.exit(process.returncode)
        else:
            logger.error("Command '%s' failed with return code: %d", command_to_run, process.returncode)
            sys.exit(process.returncode)

    except Exception as e:
        logger.error("Error executing '%s': %s", command_to_run, str(e))
        sys.exit(1)


def _execute_command_file(build_id: int, project_dir: str, command_file: str, preset: str):
    logger = get_logger(__name__)
    presets_build_path = Path(project_dir) / "df_designer" / "presets" / command_file
    with open(presets_build_path) as file:
        presets_build_file = json.load(file)

    if preset in presets_build_file:
        command_to_run = presets_build_file[preset]["cmd"]
        if preset == "success":
            command_to_run += f" {build_id}"
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        asyncio.run(_execute_command(command_to_run))
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("build_bot")
def build_bot(build_id: int, project_dir: str = settings.work_directory, preset: str = "success"):
    _execute_command_file(build_id, project_dir, "build.json", preset)


@cli.command("build_scenario")
def build_scenario(build_id: int, project_dir: str = "."):
    from app.services.json_converter import converter  # pylint: disable=C0415

    asyncio.run(converter(build_id=build_id, project_dir=project_dir))


@cli.command("run_bot")
def run_bot(build_id: int, project_dir: str = settings.work_directory, preset: str = "success"):
    _execute_command_file(build_id, project_dir, "run.json", preset)


@cli.command("run_scenario")
def run_scenario(build_id: int, project_dir: str = "."):
    script_path = Path(project_dir) / "bot" / "scripts" / f"build_{build_id}.yaml"
    if not script_path.exists():
        raise FileNotFoundError(f"File {script_path} doesn't exist")
    command_to_run = f"poetry run python {project_dir}/app.py --script-path {script_path}"
    asyncio.run(_execute_command(command_to_run))


@cli.command("run_app")
def run_app(
    ip_address: str = settings.host,
    port: int = settings.port,
    conf_reload: str = str(settings.conf_reload),
    project_dir: str = settings.work_directory,
) -> None:
    """Run the backend."""
    settings.host = ip_address
    settings.port = port
    settings.conf_reload = conf_reload.lower() in ["true", "yes", "t", "y", "1"]
    settings.work_directory = project_dir

    app_runner.run()


@cli.command("init")
def init(destination: str = settings.work_directory, no_input: bool = False, overwrite_if_exists: bool = True):
    original_dir = os.getcwd()
    pyproject = toml.load(settings.pyproject_path)
    try:
        os.chdir(destination)
        cookiecutter(
            "https://github.com/Ramimashkouk/df_d_template.git",
            no_input=no_input,
            overwrite_if_exists=overwrite_if_exists,
            extra_context={"dflowd_version": pyproject["tool"]["poetry"]["version"]},
        )
    finally:
        os.chdir(original_dir)
