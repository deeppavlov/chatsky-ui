"""
JSON Converter
---------------

Converts a user project's frontend graph to a script understandable by DFF json-importer.
"""
from pathlib import Path
from typing import Tuple

from omegaconf.dictconfig import DictConfig

from app.api.deps import get_index
from app.core.logger_config import get_logger
from app.db.base import read_conf, write_conf
from app.services.index import Index

logger = get_logger(__name__)


def _get_db_paths(build_id: int, project_dir: Path, custom_dir: str) -> Tuple[Path, Path, Path]:
    """Get paths to frontend graph, dff script, and dff custom conditions files."""

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


def _organize_graph_according_to_nodes(flow_graph: DictConfig, script: dict) -> dict:
    nodes = {}
    for flow in flow_graph["flows"]:
        for node in flow.data.nodes:
            if "flags" in node.data:
                if "start" in node.data.flags:
                    if "start_label" in script["CONFIG"]:
                        raise ValueError("There are more than one start node in the script")
                    script["CONFIG"]["start_label"] = [flow.name, node.data.name]
                if "fallback" in node.data.flags:
                    if "fallback_label" in script["CONFIG"]:
                        raise ValueError("There are more than one fallback node in the script")
                    script["CONFIG"]["fallback_label"] = [flow.name, node.data.name]
            nodes[node.id] = {"info": node}
            nodes[node.id]["flow"] = flow.name
            nodes[node.id]["TRANSITIONS"] = []
    return nodes


def _get_condition(nodes: dict, edge: DictConfig) -> DictConfig | None:
    """Get node's condition from `nodes` according to `edge` info."""
    try:
        return next(
            condition
            for condition in nodes[edge.source]["info"].data.conditions
            if condition["id"] == edge.sourceHandle
        )
    except StopIteration:
        logger.debug(
            "Condition of edge '%s' and id of '%s' is not found in the corresponding node. Expected behavior",
            edge.source,
            edge.sourceHandle,
        )
        return None


def _write_conditions_to_file(conditions_lines: list, custom_conditions_file: Path) -> None:
    """Write dff custom conditions from list to file."""
    # TODO: make reading and writing conditions async
    with open(custom_conditions_file, "w", encoding="UTF-8") as file:
        for line in conditions_lines:
            if not line.endswith("\n"):
                line = "".join([line, "\n"])
            file.write(line)


def _add_transitions(nodes: dict, edge: DictConfig, condition: DictConfig) -> None:
    """Add transitions to a node according to `edge` and `condition`."""
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


def _fill_nodes_into_script(nodes: dict, script: dict) -> None:
    """Fill nodes into dff script dictunary."""
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


def _append_condition(condition: DictConfig, conditions_lines: list) -> list:
    """Append a condition to a list"""
    condition_with_newline = "".join([condition.data.python.action + "\n\n"])

    logger.debug("Condition to append: %s", condition_with_newline)
    logger.debug("conditions_lines before appending: %s", conditions_lines)

    all_lines = conditions_lines + condition_with_newline.split("\n")
    return all_lines


async def _shift_cnds_in_index(index: Index, cnd_strt_lineno: int, diff_in_lines: int) -> None:
    """Update the start line number of conditions in index by shifting them by `diff_in_lines`."""
    services = index.get_services()
    for _, service in services.items():
        if service["type"] == "condition":
            if service["lineno"] - 1 > cnd_strt_lineno:  # -1 is here to convert from file numeration to list numeration
                service["lineno"] += diff_in_lines

    await index.indexit_all(
        [service_name for service_name, _ in services.items()],
        [service["type"] for _, service in services.items()],
        [service["lineno"] for _, service in services.items()],
    )


async def _replace_condition(condition: DictConfig, conditions_lines: list, cnd_strt_lineno: int, index: Index) -> list:
    """Replace a condition in a conditions list with a new one.

    Args:
        condition: condition to replace. `condition.data.python.action` is a string with the new condition
        conditions_lines: list of conditions lines
        cnd_strt_lineno: a pointer to the condition start line in custom conditions file
        index: index object to update

    Returns:
        list of all conditions as lines
    """
    cnd_strt_lineno = cnd_strt_lineno - 1  # conversion from file numeration to list numeration
    all_lines = conditions_lines.copy()
    condition = "".join([condition.data.python.action + "\n\n"])
    new_cnd_lines = condition.split("\n")

    old_cnd_lines_num = 0
    for lineno, line in enumerate(all_lines[cnd_strt_lineno:]):
        if line.startswith("def ") and lineno != 0:
            break
        old_cnd_lines_num += 1

    next_func_location = cnd_strt_lineno + old_cnd_lines_num

    logger.debug("new_cnd_lines\n")
    logger.debug(new_cnd_lines)
    all_lines = all_lines[:cnd_strt_lineno] + new_cnd_lines + all_lines[next_func_location:]

    diff_in_lines = len(new_cnd_lines) - old_cnd_lines_num
    logger.debug("diff_in_lines: %s", diff_in_lines)
    logger.debug("cnd_strt_lineno: %s", cnd_strt_lineno)

    await _shift_cnds_in_index(index, cnd_strt_lineno, diff_in_lines)
    return all_lines


async def converter(build_id: int, project_dir: str, custom_dir: str = "custom") -> None:
    """Translate frontend flow script into dff script."""
    index = get_index()
    await index.load()
    index.logger.debug("Loaded index '%s'", index.index)

    frontend_graph_path, script_path, custom_conditions_file = _get_db_paths(build_id, Path(project_dir), custom_dir)

    script = {
        "CONFIG": {"custom_dir": "/".join(["..", custom_dir])},
    }
    flow_graph = await read_conf(frontend_graph_path)

    nodes = _organize_graph_according_to_nodes(flow_graph, script)

    with open(custom_conditions_file, "r", encoding="UTF-8") as file:
        conditions_lines = file.readlines()

    for flow in flow_graph["flows"]:
        for edge in flow.data.edges:
            if edge.source in nodes and edge.target in nodes:
                condition = _get_condition(nodes, edge)
                if condition is None:
                    logger.error(
                        "A condition of edge '%s' - '%s' and id of '%s' is not found in the corresponding node",
                        edge.source,
                        edge.target,
                        edge.sourceHandle,
                    )
                    continue

                if condition.name not in (cnd_names := index.index):
                    logger.debug("Adding condition: %s", condition.name)
                    cnd_lineno = len(conditions_lines)
                    conditions_lines = _append_condition(condition, conditions_lines)
                    await index.indexit(condition.name, "condition", cnd_lineno + 1)
                else:
                    logger.debug("Replacing condition: %s", condition.name)
                    conditions_lines = await _replace_condition(
                        condition, conditions_lines, cnd_names[condition.name]["lineno"], index
                    )

                _add_transitions(nodes, edge, condition)
            else:
                logger.error("A node of edge '%s-%s' is not found in nodes", edge.source, edge.target)

    _fill_nodes_into_script(nodes, script)

    _write_conditions_to_file(conditions_lines, custom_conditions_file)
    await write_conf(script, script_path)
