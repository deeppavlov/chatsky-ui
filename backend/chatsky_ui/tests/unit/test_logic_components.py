from pathlib import Path

import pytest

from chatsky_ui.services.json_converter.logic_component_converter.condition_converter import (
    BadConditionException,
    CustomConditionConverter,
    SlotConditionConverter,
)
from chatsky_ui.services.json_converter.logic_component_converter.response_converter import (
    BadResponseException,
    CustomResponseConverter,
    TextResponseConverter,
)
from chatsky_ui.services.json_converter.logic_component_converter.service_replacer import store_custom_service


@pytest.fixture
def slot_condition():
    return {"name": "test_condition", "data": {"slot": "test_slot"}}


@pytest.fixture
def text_response():
    return {"name": "test_response", "data": [{"text": "test_text"}]}


class TestConditionConverter:
    def test_custom_condition_converter(self, custom_condition, converted_custom_condition):
        converted_cnd = CustomConditionConverter(custom_condition)()
        assert converted_cnd == converted_custom_condition

    def test_custom_condition_converter_fail(self, slot_condition):
        with pytest.raises(BadConditionException):
            CustomConditionConverter(slot_condition)()

    def test_slot_condition_converter(self, slot_condition, slots_conf):
        converted_cnd = SlotConditionConverter(slot_condition)(slots_conf=slots_conf)
        assert converted_cnd == {"chatsky.conditions.slots.SlotsExtracted": "test_slot"}

    def test_slot_condition_converter_fail(self, custom_condition):
        with pytest.raises(BadConditionException):
            SlotConditionConverter(custom_condition)()

    def test_slot_condition_converter_get_pre_transitions(self, slot_condition, slots_conf):
        converter = SlotConditionConverter(slot_condition)
        converter(slots_conf=slots_conf)
        assert converter.get_pre_transitions() == {"test_slot": {"chatsky.processing.slots.Extract": "test_slot"}}


class TestResponseConverter:
    def test_text_response_converter(self, text_response):
        converted_response = TextResponseConverter(text_response)()
        assert converted_response == {"chatsky.Message": {"text": "test_text"}}

    def test_text_response_converter_fail(self, custom_response):
        with pytest.raises(BadResponseException):
            TextResponseConverter(custom_response)()

    def test_custom_response_converter(self, custom_response, converted_custom_response):
        converted_response = CustomResponseConverter(custom_response)()
        assert converted_response == converted_custom_response

    def test_custom_response_converter_fail(self, text_response):
        with pytest.raises(BadResponseException):
            CustomResponseConverter(text_response)()


def test_store_custom_service():
    current_file_path = Path(__file__).resolve()
    service_code = """class test_service(BaseService):\n    async def call(self, ctx:
     Context) -> Message:\n        return Message('Hello')"""
    test_file_path = current_file_path.parent / "store_service_test.py"
    test_file_path.touch(exist_ok=True)

    try:
        store_custom_service(test_file_path, [service_code])
        assert test_file_path.stat().st_size > 0  # Check that the file is not empty
    finally:
        test_file_path.unlink()  # Clean up
