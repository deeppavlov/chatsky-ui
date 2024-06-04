from cookiecutter.main import cookiecutter
import json
import os
from pathlib import Path
import subprocess
import sys
import typer
import uvicorn
from omegaconf import OmegaConf

from app.core.config import settings
from app.core.logger_config import get_logger


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
    logger = get_logger(__name__)

    frontend_graph_path = Path(project_dir) / "df_designer" / "frontend_flows.yaml"
    script_file = Path(project_dir) / "bot" / "scripts" / f"build_{build_id}.yaml"
    custom_dir = "custom"

    custom_dir_path = "bot" / Path(custom_dir)
    custom_dir_path.mkdir(exist_ok=True, parents=True)
    custom_conditions_file = custom_dir_path / "conditions.py"

    script = {
        "CONFIG": {"custom_dir": custom_dir},
    }
    flow_graph = OmegaConf.load(frontend_graph_path)

    for flow in flow_graph:
        script[flow.name] = {}
        for node in flow.data.nodes:
            node_dict = {
                "RESPONSE": {"dff.Message": {"text": node.data.response}},
                "TRANSITIONS": [],
            }
            if node.type == "start_node":
                script["CONFIG"]["start_label"] = f"[{flow.name}, {node.data.name}]"
            for edge in flow.data.edges:
                if edge.source == node.id:
                    try:
                        condition = next(
                            cond for cond in node.data.conditions
                            if cond["id"] == edge.sourceHandle
                        )
                        node_dict["TRANSITIONS"].append(
                            {
                                "lbl": f"[{flow.name}, {node.data.name}, {condition.data.priority}]",
                                "cnd": f"""custom_dir.cnd.{condition.name}""",
                            }
                        )

                        custom_conditions = custom_conditions_file.read_text()
                        if condition.name not in custom_conditions:
                            with open(custom_conditions_file, "a") as f:
                                f.write(condition.data.action)
                    except StopIteration:
                        logger.info("Condition is not found in edge %s", edge)
                        continue
            script[flow.name][node.data.name] = node_dict

    with open(script_file, "w") as f:
        OmegaConf.save(config=script, f=f, resolve=True)


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
