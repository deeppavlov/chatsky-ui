from pathlib import Path

from app.db.base import read_conf, write_conf
from app.core.logger_config import get_logger

logger = get_logger(__name__)

async def translator(build_id: int, project_dir: str):
    frontend_graph_path = Path(project_dir) / "df_designer" / "frontend_flows.yaml"
    script_file = Path(project_dir) / "bot" / "scripts" / f"build_{build_id}.yaml"
    custom_dir = "custom"

    custom_dir_path = "bot" / Path(custom_dir)
    custom_dir_path.mkdir(exist_ok=True, parents=True)
    custom_conditions_file = custom_dir_path / "conditions.py"

    script = {
        "CONFIG": {"custom_dir": "/".join(["..", custom_dir])},
    }
    flow_graph = await read_conf(frontend_graph_path)

    nodes = {}
    for flow in flow_graph["flows"]:
        for node in flow.data.nodes:
            if node.type == "start_node":
                script["CONFIG"]["start_label"] = [flow.name, node.data.name]
            nodes[node.id] = {"info": node}
            nodes[node.id]["flow"] = flow.name
            nodes[node.id]["TRANSITIONS"] = []
    for flow in flow_graph["flows"]:
        for edge in flow.data.edges:
            if edge.source in nodes and edge.target in nodes:
                condition = next(condition for condition in nodes[edge.source]["info"].data.conditions if condition["id"] == edge.sourceHandle)

                custom_conditions = custom_conditions_file.read_text()
                custom_conditions_names = [fun.split("(")[0].strip() for fun in custom_conditions.split("def ")[1:]]
                if condition.name not in custom_conditions_names:
                    with open(custom_conditions_file, "a", encoding="UTF-8") as f:
                        f.write(condition.data.action + "\n")
                        logger.debug("Writing to %s: %s", custom_conditions_file, condition.name)
                
                nodes[edge.source]["TRANSITIONS"].append(
                    {
                        "lbl": [
                            nodes[edge.target]['flow'],
                            nodes[edge.target]['info'].data.name,
                            condition.data.priority
                        ],
                        "cnd": f"custom_dir.conditions.{condition.name}"
                    }
                )

    for _, node in nodes.items():
        if node["flow"] not in script:
            script[node["flow"]] = {}
        script[node["flow"]].update({
            node["info"].data.name: {
                "RESPONSE": {"dff.Message": {"text": node["info"].data.response}},
                "TRANSITIONS": node["TRANSITIONS"],
            },
        })

    await write_conf(script, script_file)
