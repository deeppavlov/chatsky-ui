from typing import List

import chatsky.conditions as cnd
from chatsky.core import script_parsing

AUTO_COMPLETION_MAP = {
    "ExactMatch": 'await cnd.ExactMatch("hello")(ctx)',
    "Regexp": 'await cnd.Regexp("how are you")(ctx)',
    "Any": "cnd.Any([hi_lower_case_condition, cnd.ExactMatch(hello)])(ctx)",
    "All": 'cnd.All([cnd.Regexp("talk"), cnd.Regexp("about.*music")])(ctx)',
}


def get_chatsky_conditions() -> List[dict]:
    """Gets the Chatsky's out-of-the-box conditions.

    Returns:
        List of conditions info with the following keys:
            "label": The condition name suggestions to pop up for user.
            "type": "function".
            "info": Detailed info about every condition, parsed from Chatsky docs.
            "apply": Autocompletion of the conditon call.
    """
    native_services = script_parsing.get_chatsky_objects()
    native_conditions = [k.split(".")[-1] for k, _ in native_services.items() if k.startswith("chatsky.cnd.")]
    cnd_full_info = []
    for condition in native_conditions:
        cnd_full_info.append(
            {
                "label": f"cnd.{condition}",
                "type": "function",
                "info": getattr(cnd, condition).__doc__,
                "apply": AUTO_COMPLETION_MAP.get(condition, "cnd.<CHATSKY_CONDITION>()(ctx, pipeline)"),
            }
        )

    return cnd_full_info
