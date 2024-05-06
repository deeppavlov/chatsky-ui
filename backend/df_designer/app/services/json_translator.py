from pathlib import Path
from typing import Tuple

from app.api.deps import get_index
from app.core.logger_config import get_logger
from app.db.base import read_conf, write_conf

logger = get_logger(__name__)


def get_db_paths(build_id: int, project_dir: Path, custom_dir: str) -> Tuple[Path, Path, Path]:
    frontend_graph_path = project_dir / "df_designer" / "frontend_flows.yaml"
    custom_conditions_file = project_dir / "bot" / custom_dir / "conditions.py"
    script_path = project_dir / "bot" / "scripts" / f"build_{build_id}.yaml"

    if not frontend_graph_path.exists():
        raise FileNotFoundError(f"File {frontend_graph_path} doesn't exist")
    if not custom_conditions_file.exists():
        raise FileNotFoundError(f"File {custom_conditions_file} doesn't exist")
    if not script_path.exists():
        script_path.parent.mkdir(parents=True, exist_ok=True)
        script_path.touch()

    return frontend_graph_path, script_path, custom_conditions_file


def organize_graph_according_to_nodes(flow_graph, script):
    nodes = {}
    for flow in flow_graph["flows"]:
        for node in flow.data.nodes:
            if node.type == "start_node":
                script["CONFIG"]["start_label"] = [flow.name, node.data.name]
            nodes[node.id] = {"info": node}
            nodes[node.id]["flow"] = flow.name
            nodes[node.id]["TRANSITIONS"] = []
    return nodes


def get_condition(nodes, edge):
    return next(
        condition for condition in nodes[edge.source]["info"].data.conditions if condition["id"] == edge.sourceHandle
    )


def write_conditions_to_file(conditions_lines, custom_conditions_file):
    # TODO: make reading and writing conditions async
    with open(custom_conditions_file, "w", encoding="UTF-8") as file:
        for line in conditions_lines:
            file.write(f"{line}\n")


def add_transitions(nodes, edge, condition):
    nodes[edge.source]["TRANSITIONS"].append(
        {
            "lbl": [
                nodes[edge.target]["flow"],
                nodes[edge.target]["info"].data.name,
                condition.data.priority,
            ],
            "cnd": f"custom_dir.conditions.{condition.name}",
        }
    )


def fill_nodes_into_script(nodes, script):
    for _, node in nodes.items():
        if node["flow"] not in script:
            script[node["flow"]] = {}
        script[node["flow"]].update(
            {
                node["info"].data.name: {
                    "RESPONSE": {"dff.Message": {"text": node["info"].data.response}},
                    "TRANSITIONS": node["TRANSITIONS"],
                }
            }
        )


def append_condition(condition, conditions_lines):
    condition = "".join([condition.data.python.action + "\n\n\n"])
    all_lines = conditions_lines + [
        "".join([line, "\n"]) for line in condition.split("\n")
    ]  # TODO: maintain the \n in the end
    return all_lines


def replace_condition(condition, conditions_lines, cnd_lineno):
    all_lines = conditions_lines.copy()
    condition = "".join([condition.data.python.action + "\n\n\n"])
    next_func = -1
    for lineno, line in enumerate(all_lines[cnd_lineno + 1 :]):
        if line[:4] == "def ":
            next_func = lineno
            break

    all_lines[cnd_lineno:next_func] = condition.split("\n")

    return all_lines


async def translator(build_id: int, project_dir: str, custom_dir: str = "custom"):
    index = get_index()
    await index.load()
    index.logger.debug("Loaded index '%s'", index.index)

    frontend_graph_path, script_path, custom_conditions_file = get_db_paths(build_id, Path(project_dir), custom_dir)

    script = {
        "CONFIG": {"custom_dir": "/".join(["..", custom_dir])},
    }
    flow_graph = await read_conf(frontend_graph_path)

    nodes = organize_graph_according_to_nodes(flow_graph, script)

    with open(custom_conditions_file, "r", encoding="UTF-8") as file:
        conditions_lines = file.readlines()

    for flow in flow_graph["flows"]:
        for edge in flow.data.edges:
            if edge.source in nodes and edge.target in nodes:
                condition = get_condition(nodes, edge)

                logger.debug("Adding condition: %s", condition.name)
                if condition.name not in (cnd_names := index.index):
                    cnd_lineno = len(conditions_lines)
                    conditions_lines = append_condition(condition, conditions_lines)
                    await index.indexit(condition.name, "condition", cnd_lineno)
                else:
                    conditions_lines = replace_condition(
                        condition, conditions_lines, cnd_names[condition.name]["lineno"]
                    )

                logger.debug("conditions_lines:\n%s", "".join(conditions_lines).split("\n"))

                add_transitions(nodes, edge, condition)
            else:
                logger.error("A node of edge '%s-%s' is not found in nodes", edge.source, edge.target)

    fill_nodes_into_script(nodes, script)

    write_conditions_to_file(conditions_lines, custom_conditions_file)
    await write_conf(script, script_path)
