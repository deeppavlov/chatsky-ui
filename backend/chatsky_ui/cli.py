"""
This module provides a command-line interface (CLI) for managing and running Chatsky-UI projects on a low level.

Commands:
    build_bot: Builds the bot with one of three various presets.
    build_scenario: Builds the bot with the preset `success`.
    run_bot: Runs the bot with one of three various presets.
    run_scenario: Runs the bot with the preset `success`.
    run_app: Runs the UI for your `project_dir` on `host:port`.
    init: Initializes a new Chatsky-UI project using an off-the-shelf template.

Helper Functions:
    _execute_command: Asynchronously executes a shell command.
    _execute_command_file: Reads a command from a JSON file and executes it.
"""

import asyncio
import json
import os
import string
import sys
from pathlib import Path
from typing import Optional

import nest_asyncio
import typer
from cookiecutter.main import cookiecutter

# Patch nest_asyncio before importing Chatsky
nest_asyncio.apply = lambda: None

from chatsky_ui.core.config import app_runner, settings  # noqa: E402
from chatsky_ui.core.logger_config import get_logger  # noqa: E402
from chatsky_ui.utils.repo_manager import RepoManager  # noqa: E402

cli = typer.Typer(
    help="🚀 Welcome to Chatsky-UI!\n\n"
    "To get started, use the following commands:\n\n"
    "1. `init` - Initializes a new Chatsky-UI project.\n\n"
    "2. `run_app` - Runs the UI for your project.\n"
)


async def _execute_command(command_to_run: str) -> None:
    """Asynchronously executes a shell command.

    Args:
        command_to_run (str): The command to execute.
    """
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


def _execute_command_file(project_dir: Path, command_file: str, preset: str) -> None:
    """Reads a command from a JSON file and executes it.

    Args:
        project_dir (Path): The project directory.
        command_file (str): The JSON file containing the command.
        preset (str): The preset to use. it could be one of ["success", "failure", "loop"]
    """
    logger = get_logger(__name__)

    presets_build_path = settings.presets_path / command_file
    with open(presets_build_path, encoding="UTF-8") as file:
        file_content = file.read()

    template = string.Template(file_content)
    substituted_content = template.substitute(work_directory=project_dir)

    presets_build_file = json.loads(substituted_content)
    if preset in presets_build_file:
        command_to_run = presets_build_file[preset]["cmd"]
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        asyncio.run(_execute_command(command_to_run))
    else:
        logger.error("Invalid preset '%s'. Preset must be one of %s", preset, list(presets_build_file.keys()))
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("build_bot")
def build_bot(
    build_id: int,
    messenger: Optional[str] = typer.Option("web", help="Messenger to run chat in. Must be in ['web', 'telegram']."),
    chatsky_port: Optional[int] = typer.Option(None, help="Port for the HTTP web server"),
    project_dir: Optional[Path] = typer.Option(None, help="The project directory created by the `init` command"),
    preset: Optional[str] = typer.Option("success", help="Could be one of: success, failure, loop"),
) -> None:
    """Builds the bot with one of three various presets.

    Args:
        build_id (int): The ID to assign to the build.
        messenger (Optional[str]): The messenger to run chat in. Must be in ["web", "telegram"].
        chatsky_port (Optional[int]): The port for the HTTP web server.
        project_dir (Optional[Path]): The project directory created by the `init` command".
        preset (str): The preset to use. Must be in ["success", "failure", "loop"].
    """
    project_dir = project_dir or settings.work_directory

    if not project_dir.is_dir():
        logger = get_logger(__name__)
        logger.error("Directory %s doesn't exist", project_dir)
        raise NotADirectoryError(f"Directory {project_dir} doesn't exist")
    settings.set_config(work_directory=project_dir)

    os.environ["build_id"] = str(build_id)
    os.environ["messenger"] = str(messenger)
    if chatsky_port is not None:
        os.environ["chatsky_port"] = str(chatsky_port)
    else:
        os.environ.pop("chatsky_port", None)

    _execute_command_file(project_dir, "build.json", preset)


@cli.command("build_scenario")
def build_scenario(
    build_id: int,
    messenger: str = typer.Option("web", help="Messenger to run chat in"),
    chatsky_port: int = typer.Option(None, help="Port for the HTTP web server"),
    project_dir: Path = typer.Option(Path("."), help="The project directory created by the `init` command"),
) -> None:
    """Builds the bot with preset `success`.

    Args:
        build_id (int): The build ID.
        messenger (str): The messenger to run chat in.
        chatsky_port (int): The port for the HTTP web server.
        project_dir (Path): The project directory.
    """
    if not project_dir.is_dir():
        logger = get_logger(__name__)
        logger.error("Directory %s doesn't exist", project_dir)
        raise NotADirectoryError(f"Directory {project_dir} doesn't exist")
    settings.set_config(work_directory=project_dir)

    from chatsky_ui.services.json_converter.pipeline_converter import PipelineConverter  # pylint: disable=C0415

    pipeline_converter = PipelineConverter()
    pipeline_converter(
        build_id=build_id,
        input_file=settings.frontend_flows_path,
        output_dir=settings.scripts_dir,
        messenger=messenger,
        chatsky_port=chatsky_port,
    )


@cli.command("run_bot")
def run_bot(
    project_dir: Path = typer.Option(None, help="The project directory created by the `init` command"),
    preset: str = typer.Option("success", help="Could be one of: success, failure, loop"),
    run_id: int = typer.Option(0, help="ID of the RunProcess to run"),
):
    """
    Runs the bot with one of three various presets.

    Args:
        project_dir (Path): "The project directory created by the `init` command".
        preset (str): The preset to use.
        run_id (int): The run_id of the `Run` process.
    """
    project_dir = project_dir or settings.work_directory

    if not project_dir.is_dir():
        logger = get_logger(__name__)
        logger.error("Directory %s doesn't exist", project_dir)
        raise NotADirectoryError(f"Directory {project_dir} doesn't exist")
    settings.set_config(work_directory=project_dir)

    os.environ["run_id"] = str(run_id)

    _execute_command_file(project_dir, "run.json", preset)


@cli.command("run_scenario")
def run_scenario(
    project_dir: Path = typer.Option(Path("."), help="The project directory created by the `init` command"),
    run_id: int = typer.Option(0, help="ID of the RunProcess to run"),
):
    """
    Runs the bot with preset `success`.

    Args:
        project_dir (Path): "The project directory created by the `init` command".
        run_id (int): The run_id of the `Run` process.
    """
    if not project_dir.is_dir():
        raise NotADirectoryError(f"Directory {project_dir} doesn't exist")
    settings.set_config(work_directory=project_dir)

    command_to_run = f"{project_dir}/app.py --working-dir {project_dir} --run-id {run_id}"
    try:
        asyncio.run(_execute_command("python " + command_to_run))
    except FileNotFoundError:
        asyncio.run(_execute_command("python3 " + command_to_run))


@cli.command("run_app")
def run_app(
    host: Optional[str] = typer.Option(None, help="The host to run the UI on."),
    port: Optional[int] = typer.Option(None, help="The port to run the UI on."),
    log_level: Optional[str] = typer.Option(None, help="The log level."),
    conf_reload: Optional[bool] = typer.Option(None, help="True for dev-mode, False otherwise"),
    project_dir: Path = typer.Option(Path("."), help="The project directory created by the `init` command"),
) -> None:
    """
    Runs the UI for your `project_dir` on `host:port`.

    Args:
        host (str): The host to run the UI on.
        port (int): The port to run the UI on.
        log_level (str): The log level.
        conf_reload (bool): True for dev-mode, False otherwise.
        project_dir (Path): "The project directory created by the `init` command".
    """
    host = host or settings.host
    port = port or settings.port
    log_level = log_level or settings.log_level
    conf_reload = conf_reload or settings.conf_reload

    if not project_dir.is_dir():
        logger = get_logger(__name__)
        logger.error("Directory %s doesn't exist", project_dir)
        raise NotADirectoryError(f"Directory {project_dir} doesn't exist")

    settings.set_config(
        host=host,
        port=port,
        log_level=log_level,
        conf_reload=str(conf_reload).lower() in ["true", "yes", "t", "y", "1"],
        work_directory=project_dir,
    )
    if conf_reload:
        settings.save_config()  # this is for the sake of maintaining the state of the settings

    app_runner.set_settings(settings)
    app_runner.run()


@cli.command("init")
def init(
    destination: Path = typer.Option(None, help="Path where you want to create your project"),
    no_input: bool = typer.Option(False, help="True for quick and easy initialization using default values"),
    overwrite_if_exists: bool = typer.Option(True, help="True for replacing any project named as `my_project`)"),
) -> None:
    """
    Initializes a new Chatsky-UI project using an off-the-shelf template.

    Args:
        destination (Path): The path where you want to create your project.
        no_input (bool): True for quick and easy initialization using default values.
        overwrite_if_exists (bool): True for replacing any project named as `my_project`.
    """
    destination = destination or settings.work_directory

    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        proj_path = cookiecutter(
            "https://github.com/deeppavlov/chatsky-ui-template.git",
            no_input=no_input,
            overwrite_if_exists=overwrite_if_exists,
        )
    finally:
        os.chdir(original_dir)

    RepoManager.init_new_repo(Path(proj_path) / "bot", tag_name="0")
    RepoManager.init_new_repo(Path(proj_path) / "chatsky_ui/app_data", tag_name="0")
