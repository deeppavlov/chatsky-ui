import asyncio
import json
import os
import sys
from pathlib import Path

import typer
import uvicorn
from cookiecutter.main import cookiecutter
from git import Repo

from app.core.config import settings
from app.core.logger_config import get_logger
from app.services.json_translator import translator
from app.utils.git_cmd import commit_changes

cli = typer.Typer()


def init_new_repo(git_path: Path, tag_name: str):
    repo = Repo.init(git_path)
    repo.git.checkout(b="dev")
    commit_changes(repo, "Init frontend flows")
    repo.create_tag(tag_name)


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
            command_to_run += f" {build_id} --call_from_open_event_loop True"
        logger.debug("Executing command for preset '%s': %s", preset, command_to_run)

        asyncio.run(_execute_command(command_to_run))
    else:
        raise ValueError(f"Invalid preset '{preset}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("build_bot")
def build_bot(build_id: int, project_dir: str = settings.work_directory, preset: str = "success"):
    _execute_command_file(build_id, project_dir, "build.json", preset)


@cli.command("build_scenario")
def build_scenario(build_id: int, project_dir: str = ".", call_from_open_event_loop: bool = False):
    if call_from_open_event_loop:
        loop = asyncio.get_event_loop()
        loop.create_task(translator(build_id=build_id, project_dir=project_dir))
        loop.run_until_complete(asyncio.wait([], return_when=asyncio.FIRST_COMPLETED))
    else:
        asyncio.run(translator(build_id=build_id, project_dir=project_dir))


@cli.command("run_bot")
def run_bot(build_id: int, project_dir: str = settings.work_directory, preset: str = "success"):
    _execute_command_file(build_id, project_dir, "run.json", preset)


@cli.command("run_scenario")
def run_scenario(build_id: int, project_dir: str = ".", call_from_open_event_loop: bool = False):
    # checkout the commit and then run the build
    bot_repo = Repo.init(Path(project_dir) / "bot")
    bot_repo.git.checkout(build_id, "scripts/build.yaml")

    script_path = Path(project_dir) / "bot" / "scripts" / "build.yaml"
    if not script_path.exists():
        raise FileNotFoundError(f"File {script_path} doesn't exist")
    command_to_run = f"poetry run python {project_dir}/app.py --script-path {script_path}"
    if call_from_open_event_loop:
        loop = asyncio.get_event_loop()
        loop.create_task(_execute_command(command_to_run))
        loop.run_until_complete(asyncio.wait([], return_when=asyncio.FIRST_COMPLETED))
    else:
        asyncio.run(_execute_command(command_to_run))


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
        reload_dirs=str(settings.work_directory),
    )
    settings.server = uvicorn.Server(settings.uvicorn_config)
    settings.server.run()


@cli.command("init")
def init(destination: str = settings.work_directory, no_input: bool = False, overwrite_if_exists: bool = True):
    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        proj_path = cookiecutter(
            "https://github.com/Ramimashkouk/df_d_template.git",
            no_input=no_input,
            overwrite_if_exists=overwrite_if_exists,
            checkout="feat/versioning",
        )
    finally:
        os.chdir(original_dir)

    init_new_repo(Path(proj_path) / "bot", tag_name="43")
    init_new_repo(Path(proj_path) / "df_designer", tag_name="43")
