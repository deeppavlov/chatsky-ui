from dff.pipeline.pipeline import script_parsing
import dff.script.conditions as cnd


AUTO_COMPLETION_MAP = {
    "exact_match": 'cnd.exact_match(Message("hello"))(ctx, pipeline)',
    "regexp": 'cnd.regexp(r"how are you", re.IGNORECASE)(ctx, pipeline)',
    "any": 'cnd.any([hi_lower_case_condition, cnd.exact_match(Message("hello"))])(ctx, pipeline)',
    "all": 'cnd.all([cnd.regexp(r"talk"), cnd.regexp(r"about.*music")])(ctx, pipeline)',
}


def get_dff_conditions():
    native_services = script_parsing.get_dff_objects()
    native_conditions = [k.split(".")[-1] for k, _ in native_services.items() if k.startswith("dff.cnd.")]
    cnd_full_info = []
    for condition in native_conditions:
        cnd_full_info.append(
            {
                "label": f"cnd.{condition}",
                "type": "function",
                "info": getattr(cnd, condition).__doc__,
                "apply": AUTO_COMPLETION_MAP.get(condition, "cnd.<DFF_CONDITION>()(ctx, pipeline)"),
            }
        )

    return cnd_full_info
