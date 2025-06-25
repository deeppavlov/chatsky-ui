from omegaconf import OmegaConf


async def get_llm_model_config(llm_model_config_id) -> dict:
    """Get the configuration for a specific LLM model.

    Args:
        llm_model_config_id (str): The ID of the LLM model configuration.

    Returns:
        dict: The configuration for the specified LLM model.
    """
    from chatsky_ui.core.config import settings
    from chatsky_ui.db.base import read_conf

    omega_llms_conf = await read_conf(settings.llms_conf_path, settings.llms_path_lock)
    llms_conf = OmegaConf.to_container(omega_llms_conf, resolve=True)

    if llm_model_config_id not in llms_conf["config_models"]:
        raise ValueError(f"LLM model config ID {llm_model_config_id} not found.")
    return llms_conf["config_models"][llm_model_config_id]
