import asyncio
from abc import ABC, abstractmethod

from chatsky_ui.utils.llm_config_helper import get_llm_model_config

from ....core.config import settings
from ....schemas.front_graph_components.info_holders.condition import CustomCondition, LLMCondition, SlotCondition
from ..base_converter import BaseConverter
from ..consts import CONDITIONS_FILE, CUSTOM_FILE
from .service_replacer import store_custom_service


class BadConditionException(Exception):
    """An exception raised when a converter receives a condition which doesn't have required fields."""

    pass


class ConditionConverter(BaseConverter, ABC):
    """A base class which converts frontend's `Conditions` into respective Chatsky `BaseCondition` derivatives."""

    def __init__(self):
        self.condition = None

    def _convert(self):
        if self.condition is None:
            raise BadConditionException("Condition is not initialized")

    @abstractmethod
    def get_pre_transitions(self):
        raise NotImplementedError


class CustomConditionConverter(ConditionConverter):
    """Converts a frontend's custom condition into a Chatsky `BaseCondition`."""

    def __init__(self, condition: dict):
        """Creates a `CustomConditionConverter` object.

        Args:
            condition (dict): The custom `Condition` to be converted.

        Raises:
            BadConditionException: if the provided condition doesn't have required fields.
        """
        super().__init__()
        try:
            self.condition = CustomCondition(
                name=condition["name"],
                code=condition["data"]["python"]["action"],
            )
        except KeyError as missing_key:
            raise BadConditionException("Missing key in custom condition data") from missing_key

    def _convert(self):
        """Converts the received `CustomCondition` into a Chatsky `Condition`.
        Saves the condition into the "settings.conditions_path" file. (appends it to the file)
        Then, returns an address of that condition within the file.
        """
        super()._convert()
        store_custom_service(settings.conditions_path, [self.condition.code])
        custom_cnd = {f"{CUSTOM_FILE}.{CONDITIONS_FILE}.{self.condition.name}": None}
        return custom_cnd

    def get_pre_transitions(self):
        """Returns an empty dictionary, because it's a custom condition.
        If anyone wants to run some code before the main condition, they can
        insert it directly into the condition's code.
        """
        return {}


class SlotConditionConverter(ConditionConverter):
    """Converts a frontend's slot condition into a Chatsky `SlotsExtracted` condition."""

    def __init__(self, condition: dict):
        """Creates a `SlotConditionConverter` object.

        Args:
            condition (dict): The `SlotCondition` to be converted.

        Raises:
            BadConditionException: if the provided condition doesn't have required fields.
        """
        super().__init__()
        try:
            self.condition = SlotCondition(slot_id=condition["data"]["slot"], name=condition["name"])
        except KeyError as missing_key:
            raise BadConditionException("Missing key in slot condition data") from missing_key

    def __call__(self, *args, **kwargs):
        """Converts saved data into a Chatsky `Condition` then returns it.

        Keyword Arguments:
            slots_conf: A dictionary with slot ids as keys and respective slot paths as values.
        """
        self.slots_conf = kwargs["slots_conf"]
        return super().__call__(*args, **kwargs)

    def _convert(self):
        """Converts the received `SlotCondition` into a Chatsky `Condition` and returns it."""
        super()._convert()
        return {"chatsky.conditions.slots.SlotsExtracted": self.slots_conf[self.condition.slot_id]}

    def get_pre_transitions(self):
        """Returns a Chatsky `PRE-TRANSITION`, which configures the Chatsky `Script` to extract the
        converted `Slot` before the condition checks if the slot was extracted.
        """
        slot_path = self.slots_conf[self.condition.slot_id]  # type: ignore
        return {slot_path: {"chatsky.processing.slots.Extract": slot_path}}


class LLMConditionConverter(ConditionConverter):
    def __init__(self, condition: dict):
        super().__init__()
        try:
            config_model_name = self._get_model_config(condition)["name"]
            self.condition = LLMCondition(
                name=condition["name"],
                model_name=config_model_name,
                prompt=condition["data"]["llm"]["prompt"],
            )
        except KeyError as missing_key:
            raise BadConditionException("Missing key in LLM condition data") from missing_key

    def _get_model_config(self, condition: dict):
        """Fetches the model configuration for the LLM condition.
        Args:
            condition (dict): The LLM condition to be converted.
        Returns:
            dict: The model configuration for the LLM condition.
        """
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_llm_model_config(condition["data"]["llm"]["llm_config_id"]))

    def _convert(self):
        super()._convert()

        condition_data = self.condition.model_dump()
        condition_data.update(
            {
                "method": {
                    "chatsky.llm.methods.Contains": {
                        "pattern": "TRUE",
                    }
                }
            }
        )
        return {"chatsky.conditions.llm.LLMCondition": condition_data}

    def get_pre_transitions(self):
        return {}
