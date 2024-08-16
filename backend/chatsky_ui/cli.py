import asyncio
import json
import os
import string
import sys
from pathlib import Path

import nest_asyncio
import typer
from cookiecutter.main import cookiecutter
from typing_extensions import Annotated

# Patch nest_asyncio before importing DFF
nest_asyncio.apply = lambda: None

from chatsky_ui.core.config import app_runner, settings  # noqa: E402
from chatsky_ui.core.logger_config import get_logger  # noqa: E402

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


def _execute_command_file(build_id: int, project_dir: Path, command_file: str, preset: str):
    logger = get_logger(__name__)

    presets_build_path = project_dir / "df_designer" / "presets" / command_file
    with open(presets_build_path, encoding="UTF-8") as file:
        file_content = file.read()

    template = string.Template(file_content)
    substituted_content = template.substitute(work_directory=project_dir, build_id=build_id)

    presets_build_file = json.loads(substituted_content)
    if preset in presets_build_file:
        command_to_run = presets_build_file[preset]["cmd"]
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        asyncio.run(_execute_command(command_to_run))
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("build_bot")
def build_bot(
    build_id: Annotated[int, typer.Argument(help="Id to save the build with")],
    project_dir: Path = settings.work_directory,
    preset: Annotated[str, typer.Option(help="Could be one of: success, failure, loop")] = "success",
):
    """Builds the bot with one of three various presets."""
    _execute_command_file(build_id, project_dir, "build.json", preset)


@cli.command("build_scenario")
def build_scenario(
    build_id: Annotated[int, typer.Argument(help="Id to save the build with")],
    project_dir: Annotated[str, typer.Option(help="Your Chatsky-UI project directory")] = ".",
):
    """Builds the bot with preset `success`"""
    from chatsky_ui.services.json_converter import converter  # pylint: disable=C0415

    asyncio.run(converter(build_id=build_id, project_dir=project_dir))


@cli.command("run_bot")
def run_bot(
    build_id: Annotated[int, typer.Argument(help="Id of the build to run")],
    project_dir: Annotated[Path, typer.Option(help="Your Chatsky-UI project directory")] = settings.work_directory,
    preset: Annotated[str, typer.Option(help="Could be one of: success, failure, loop")] = "success",
):
    """Runs the bot with one of three various presets."""
    _execute_command_file(build_id, project_dir, "run.json", preset)


@cli.command("run_scenario")
def run_scenario(
    build_id: Annotated[int, typer.Argument(help="Id of the build to run")],
    project_dir: Annotated[str, typer.Option(help="Your Chatsky-UI project directory")] = ".",
):
    """Runs the bot with preset `success`"""
    script_path = Path(project_dir) / "bot" / "scripts" / f"build_{build_id}.yaml"
    if not script_path.exists():
        raise FileNotFoundError(f"File {script_path} doesn't exist")
    command_to_run = f"python {project_dir}/app.py --script-path {script_path}"
    asyncio.run(_execute_command(command_to_run))


@cli.command("run_app")
def run_app(
    host: str = settings.host,
    port: int = settings.port,
    log_level: str = settings.log_level,
    conf_reload: Annotated[str, typer.Option(help="True for dev-mode, False otherwise")] = str(settings.conf_reload),
    project_dir: Annotated[Path, typer.Option(help="Your Chatsky-UI project directory")] = Path("."),
) -> None:
    """Runs the UI for your `project_dir` on `host:port`."""
    if not project_dir.exists():
        raise FileNotFoundError(f"File {project_dir} doesn't exist")
    settings.set_config(host, port, log_level, conf_reload.lower() in ["true", "yes", "t", "y", "1"], project_dir)

    if conf_reload:
        settings.save_config()  # this is for the sake of maintaining the state of the settings

    app_runner.set_settings(settings)
    app_runner.run()


@cli.command("init")
def init(
    destination: Annotated[
        Path, typer.Option(help="Path where you want to create your project")
    ] = settings.work_directory,
    no_input: Annotated[bool, typer.Option(help="True for quick and easy initialization using default values")] = False,
    overwrite_if_exists: Annotated[
        bool,
        typer.Option(help="True for replacing any project named as `my_project`)"),
    ] = True,
):
    """Initializes a new Chatsky-UI project using an off-the-shelf template."""
    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        cookiecutter(
            "https://github.com/Ramimashkouk/df_d_template.git",
            no_input=no_input,
            overwrite_if_exists=overwrite_if_exists,
            checkout="1eca02238980ce2dd5c940f2323cddef9882a6f5",
        )
    finally:
        os.chdir(original_dir)
