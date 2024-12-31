from chatsky_ui.services.json_converter.slots_converter import GroupSlotConverter, RegexpSlotConverter, SlotsConverter


class TestSlotsConverter:
    def test_slots_converter(self, flow, converted_group_slot):
        converted_slots = SlotsConverter([flow])()

        assert converted_slots == converted_group_slot

    def test_regexp_slot_converter(self, regexp_slot, converted_regexp_slot):
        converted_slot = RegexpSlotConverter(regexp_slot)()

        assert converted_slot == converted_regexp_slot

    def test_group_slot_converter(self, group_slot, converted_group_slot):
        converted_slot = GroupSlotConverter(group_slot)()

        assert converted_slot == converted_group_slot
