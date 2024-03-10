import asyncio
from cookiecutter.main import cookiecutter
import dff
import json
import os
import subprocess
import typer
import uvicorn

from df_designer.settings import app
from sqlalchemy import create_engine
from df_designer.db_connection import Base
from df_designer.logic import get_logger


logger = get_logger(__name__)


cli = typer.Typer()


@cli.command("build_scenario")
def build_scenario(
    project_dir: str = app.work_directory
):
    print("in developing ...")


@cli.command()
def meta():
    print(f"dff version: {dff.__version__}")


@cli.command("run_backend")
def run_backend(
    ip_address: str = app.conf_host,
    port: int = app.conf_port,
    dir_logs: str = app.dir_logs,
    cmd_to_run: str = app.cmd_to_run,
    conf_reload: str = str(app.conf_reload),
    project_dir: str = app.work_directory,
) -> None:
    """Run the backend."""
    setup_backend(ip_address, port, dir_logs, cmd_to_run, conf_reload, project_dir)
    app.server.run()


@cli.command("run_app")
def run_app(
    port: int = app.conf_ui_port,
    host: str = app.conf_host,
    project_dir: str = app.work_directory
) -> None:
    setup_backend(
        ip_address = host,
        port = app.conf_port,
        dir_logs = app.dir_logs,
        cmd_to_run = app.cmd_to_run,
        conf_reload = str(app.conf_reload),
        project_dir = project_dir
    )
    asyncio.run(asyncio.gather(run_frontend(port=port), run_server()))


def setup_database(project_dir: str) -> None:
    engine = create_engine(f"sqlite:///{project_dir}/{app.database_file}")
    Base.metadata.create_all(engine)


def setup_server(ip_address: str, port: int, conf_reload: str, project_dir: str) -> None:
    config = uvicorn.Config(
        app=app.conf_app,
        host=ip_address,
        port=port,
        log_level=app.conf_log_level,
        reload=conf_reload.lower() in ["true", "yes", "t", "y", "1"],
        reload_dirs=project_dir
    )
    app.server = uvicorn.Server(config)


def setup_backend(ip_address: str, port: int, dir_logs: str, cmd_to_run: str, conf_reload: str, project_dir: str) -> None:
    app.cmd_to_run = cmd_to_run
    app.dir_logs = dir_logs
    app.work_directory = project_dir
    setup_database(project_dir)
    setup_server(ip_address, port, conf_reload, project_dir)


async def run_server() -> None:
    await app.server.run()


async def run_frontend(
    port: int = app.conf_ui_port
) -> None:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(current_dir, "..", "df_designer_front")
    try:
        process = await asyncio.create_subprocess_exec(
            "npm", "start", "--", "--port", str(port), cwd=frontend_dir
        )
        await process.communicate()
    except Exception as e:
        print(f"Failed to run frontend: {e}")



@cli.command("build_bot")
def build_bot(
    project_dir: str = app.work_directory,
    preset_name: str = "success"
):
    presets_build_path = os.path.join(project_dir, "df_designer", "presets", "build.json")
    with open(presets_build_path) as file:
        presets_build_file = json.load(file)

    if preset_name in presets_build_file:
        command_to_run = presets_build_file[preset_name]["cmd"]
        logger.info(f"Executing command for preset '{preset_name}': {command_to_run}")

        process = subprocess.run(command_to_run, shell=True)
        if process.returncode > 0:
            logger.error(
                f"Execution of command `{command_to_run}` was unsuccessful. Exited with code '{process.returncode}'"
            )
            # TODO: inform ui
    else:
        raise ValueError(f"Invalid preset '{preset_name}'. Preset must be one of {list(presets_build_file.keys())}")


@cli.command("init")
def init(
    destination: str = app.work_directory
):
    original_dir = os.getcwd()
    try:
        os.chdir(destination)
        cookiecutter("https://github.com/Ramimashkouk/df_d_template.git")
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    cli()
