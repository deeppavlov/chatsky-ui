from abc import ABC, abstractmethod

from ....core.config import settings
from ....schemas.front_graph_components.info_holders.condition import CustomCondition, SlotCondition
from ..base_converter import BaseConverter
from ..consts import CONDITIONS_FILE, CUSTOM_FILE
from .service_replacer import store_custom_service


class BadConditionException(Exception):
    """An exception raised when a converter receives a condition which doesn't have required fields."""

    pass


class ConditionConverter(BaseConverter, ABC):
    """A base class which converts frontend's `Conditions` into respective Chatsky `BaseCondition` derivatives."""

    @abstractmethod
    def get_pre_transitions():
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
        self.condition = None
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
        self.condition = None
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
        return {"chatsky.conditions.slots.SlotsExtracted": self.slots_conf[self.condition.slot_id]}

    def get_pre_transitions(self):
        """Returns a Chatsky `PRE-TRANSITION`, which configures the Chatsky `Script` to extract the
        converted `Slot` before the condition checks if the slot was extracted.
        """
        slot_path = self.slots_conf[self.condition.slot_id]  # type: ignore
        return {slot_path: {"chatsky.processing.slots.Extract": slot_path}}
