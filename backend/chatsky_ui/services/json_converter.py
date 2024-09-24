"""
JSON Converter
---------------

Converts a user project's frontend graph to a script understandable by Chatsky json-importer.
"""
import ast
from collections import defaultdict
from pathlib import Path
from typing import List, Optional, Tuple

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger
from chatsky_ui.db.base import read_conf, write_conf
from chatsky_ui.services.condition_finder import ServiceReplacer
from omegaconf.dictconfig import DictConfig

logger = get_logger(__name__)

PRE_TRANSITIONS_PROCESSING = "PRE_TRANSITIONS_PROCESSING"


PRE_TRANSITION = "PRE_TRANSITION"


def _get_db_paths(build_id: int) -> Tuple[Path, Path, Path, Path]:
    """Get paths to frontend graph, chatsky script, and chatsky custom conditions files."""
    frontend_graph_path = settings.frontend_flows_path
    custom_conditions_file = settings.conditions_path
    custom_responses_file = settings.responses_path
    script_path = settings.scripts_dir / f"build_{build_id}.yaml"

    if not frontend_graph_path.exists():
        raise FileNotFoundError(f"File {frontend_graph_path} doesn't exist")
    if not custom_conditions_file.exists():
        raise FileNotFoundError(f"File {custom_conditions_file} doesn't exist")
    if not custom_responses_file.exists():
        raise FileNotFoundError(f"File {custom_responses_file} doesn't exist")
    if not script_path.exists():
        script_path.parent.mkdir(parents=True, exist_ok=True)
        script_path.touch()

    return frontend_graph_path, script_path, custom_conditions_file, custom_responses_file


def _organize_graph_according_to_nodes(flow_graph: DictConfig, script: dict) -> Tuple[dict, dict]:
    nodes = {}
    for flow in flow_graph["flows"]:
        node_names_in_one_flow = []
        for node in flow.data.nodes:
            if "flags" in node.data:
                if "start" in node.data.flags:
                    if "start_label" in script:
                        raise ValueError("There are more than one start node in the script")
                    script["start_label"] = [flow.name, node.data.name]
                if "fallback" in node.data.flags:
                    if "fallback_label" in script:
                        raise ValueError("There are more than one fallback node in the script")
                    script["fallback_label"] = [flow.name, node.data.name]

            if node.data.name in node_names_in_one_flow:
                raise ValueError(f"There is more than one node with the name '{node.data.name}' in the same flow.")
            node_names_in_one_flow.append(node.data.name)
            nodes[node.id] = {"info": node}
            nodes[node.id]["flow"] = flow.name
            nodes[node.id]["TRANSITIONS"] = []
            nodes[node.id][PRE_TRANSITION] = dict()

    def _convert_slots(slots: dict) -> dict:
        group_slot = defaultdict(dict)
        for slot_name, slot_values in slots.copy().items():
            slot_type = slot_values["type"]
            del slot_values["id"]
            del slot_values["type"]
            if slot_type != "GroupSlot":
                group_slot[slot_name].update({f"chatsky.slots.{slot_type}": {k: v for k, v in slot_values.items()}})
            else:
                group_slot[slot_name] = _convert_slots(slot_values)
        return dict(group_slot)

    if "slots" in flow_graph:
        script["slots"] = _convert_slots(flow_graph["slots"])

    return nodes, script


def _get_condition(nodes: dict, edge: DictConfig) -> Optional[DictConfig]:
    """Get node's condition from `nodes` according to `edge` info."""
    return next(
        (condition for condition in nodes[edge.source]["info"].data.conditions if condition["id"] == edge.sourceHandle),
        None,
    )


def _add_transitions(nodes: dict, edge: DictConfig, condition: DictConfig, slots: DictConfig) -> None:
    """Add transitions to a node according to `edge` and `condition`."""

    def _get_slot(slots, id_):
        if not slots:
            return ""
        for name, value in slots.copy().items():
            slot_path = name
            if value.get("id") == id_:
                return name
            elif value.get("type") != "GroupSlot":
                continue
            else:
                del value["id"]
                del value["type"]
                slot_path = _get_slot(value, id_)
                if slot_path:
                    slot_path = ".".join([name, slot_path])
        return slot_path

    if condition["type"] == "python":
        converted_cnd = {f"custom.conditions.{condition.name}": None}
    elif condition["type"] == "slot":
        slot = _get_slot(slots, id_=condition.data.slot)
        converted_cnd = {"chatsky.conditions.slots.SlotsExtracted": slot}
        nodes[edge.source][PRE_TRANSITION].update({slot: {"chatsky.processing.slots.Extract": slot}})
    # TODO: elif condition["type"] == "chatsky":
    else:
        raise ValueError(f"Unknown condition type: {condition['type']}")

    # if the edge is a link_node, we add transition of its source and target
    if nodes[edge.target]["info"].type == "link_node":
        flow = nodes[edge.target]["info"].data.transition.target_flow

        target_node = nodes[edge.target]["info"].data.transition.target_node
        node = nodes[target_node]["info"].data.name
    else:
        flow = nodes[edge.target]["flow"]
        node = nodes[edge.target]["info"].data.name

    nodes[edge.source]["TRANSITIONS"].append(
        {
            "dst": [
                flow,
                node,
            ],
            "priority": condition.data.priority,
            "cnd": converted_cnd,
        }
    )


def _fill_nodes_into_script(nodes: dict, script: dict) -> None:
    """Fill nodes into chatsky script dictunary."""
    for _, node in nodes.items():
        if node["info"].type in ["link_node", "slots_node"]:
            continue
        if node["flow"] not in script["script"]:
            script["script"][node["flow"]] = {}
        script["script"][node["flow"]].update(
            {
                node["info"].data.name: {
                    "RESPONSE": node["info"].data.response,
                    "TRANSITIONS": node["TRANSITIONS"],
                    PRE_TRANSITION: node[PRE_TRANSITION],
                }
            }
        )


async def update_responses_lines(nodes: dict) -> Tuple[dict, List[str]]:
    """Organizes the responses in nodes in a format that json-importer accepts.

    If the response type is "python", its function will be added to responses_lines to be written
    to the custom_conditions_file later.
    * If the response already exists in the responses_lines, it will be replaced with the new one.
    """
    responses_list = []
    for node in nodes.values():
        if node["info"].type in ["link_node", "slots_node"]:
            continue
        response = node["info"].data.response
        logger.debug("response type: %s", response.type)
        if response.type == "python":
            response.data = response.data[0]
            logger.info("Adding response: %s", response)

            responses_list.append(response.data.python.action)
            node["info"].data.response = {f"custom.responses.{response.name}": None}
        elif response.type == "text":
            response.data = response.data[0]
            logger.debug("Adding response: %s", response.data.text)
            node["info"].data.response = {"chatsky.Message": {"text": response.data.text}}
        elif response.type == "choice":
            # logger.debug("Adding response: %s", )
            chatsky_responses = []
            for message in response.data:
                if "text" in message:
                    chatsky_responses.append({"chatsky.Message": {"text": message["text"]}})
                else:  # TODO: check: are you sure that you can use only "text" type inside a choice?
                    raise ValueError("Unknown response type. There must be a 'text' field in each message.")
            node["info"].data.response = {"chatsky.rsp.choice": chatsky_responses.copy()}
        else:
            raise ValueError(f"Unknown response type: {response.type}")
    return nodes, responses_list


def map_interface(interface: DictConfig) -> dict:
    """Map frontend interface to chatsky interface."""
    if not isinstance(interface, DictConfig):
        raise ValueError(f"Interface must be a dictionary. Got: {type(interface)}")
    keys = interface.keys()
    if len(keys)!=1:
        raise ValueError("There must be only one key in the interface")

    key = next(iter(keys))
    if key == "telegram":
        if "token" not in interface[key]:
            raise ValueError("Token keyworkd is not provided for telegram interface")
        if not interface[key]["token"]:
            raise ValueError("Token is not provided for telegram interface")
        return {
            "chatsky.messengers.telegram.LongpollingInterface": {
                "token": interface[key]["token"]
            }
        }
    if key == "cli":
        return {
            "chatsky.messengers.console.CLIMessengerInterface": {}
        }
    else:
        raise ValueError(f"Unknown interface: {key}")

async def converter(build_id: int) -> None:
    """Translate frontend flow script into chatsky script."""
    frontend_graph_path, script_path, custom_conditions_file, custom_responses_file = _get_db_paths(build_id)

    flow_graph: DictConfig = await read_conf(frontend_graph_path)  # type: ignore
    script = {
        "script": {},
        "messenger_interface": map_interface(flow_graph["interface"]),
    }
    del flow_graph["interface"]

    nodes, script = _organize_graph_according_to_nodes(flow_graph, script)

    with open(custom_responses_file, "r", encoding="UTF-8") as file:
        responses_tree = ast.parse(file.read())

    nodes, responses_list = await update_responses_lines(nodes)

    logger.info("Responses list: %s", responses_list)
    replacer = ServiceReplacer(responses_list)
    replacer.visit(responses_tree)

    with open(custom_responses_file, "w") as file:
        file.write(ast.unparse(responses_tree))

    with open(custom_conditions_file, "r", encoding="UTF-8") as file:
        conditions_tree = ast.parse(file.read())

    conditions_list = []

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
                if condition.type == "python":
                    conditions_list.append(condition.data.python.action)

                _add_transitions(nodes, edge, condition, flow_graph["slots"])
            else:
                logger.error("A node of edge '%s-%s' is not found in nodes", edge.source, edge.target)

    replacer = ServiceReplacer(conditions_list)
    replacer.visit(conditions_tree)

    with open(custom_conditions_file, "w") as file:
        file.write(ast.unparse(conditions_tree))

    _fill_nodes_into_script(nodes, script)

    await write_conf(script, script_path)
