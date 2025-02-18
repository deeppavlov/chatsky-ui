import pytest
from chatsky import PRE_RESPONSE, PRE_TRANSITION, RESPONSE, TRANSITIONS


@pytest.fixture
def custom_condition():
    return {
        "id": "condition1",
        "name": "test_condition",
        "type": "python",
        "data": {
            "priority": 1,
            "transition_type": "manual",
            "python": {
                "action": """class test_condition(BaseCondition):\n    async def call(self, ctx:
                 Context) -> bool:\n        return True"""
            },
        },
        "dst": "dst_test_node",
    }


@pytest.fixture
def converted_custom_condition():
    return {"custom.conditions.test_condition": None}


@pytest.fixture
def custom_response():
    return {
        "name": "test_response",
        "type": "python",
        "data": [
            {
                "python": {
                    "action": """class test_response(BaseResponse):\n    async def call(self, ctx:
                     Context) -> Message:\n        return Message('Hello')"""
                }
            }
        ],
    }


@pytest.fixture
def converted_custom_response():
    return {"custom.responses.test_response": None}


@pytest.fixture
def slots_conf():
    return {"test_slot": "test_slot"}


# @pytest.fixture
# def converted_pre_transition():
#     return {
#         "test_slot": {
#             "chatsky.processing.slots.Extract": "test_slot"
#         }
#     }


@pytest.fixture
def regexp_slot():
    return {
        "id": "test_slot_id",
        "name": "test_slot",
        "type": "RegexpSlot",
        "value": "test_regexp_value",
        "match_group_idx": 1,
    }


@pytest.fixture
def converted_regexp_slot():
    return {
        "test_slot": {
            "chatsky.slots.RegexpSlot": {
                "regexp": "test_regexp_value",
                "match_group_idx": 1,
            }
        }
    }


@pytest.fixture
def group_slot(regexp_slot):
    return {"name": "group_slot", "slots": [regexp_slot]}


@pytest.fixture
def converted_group_slot(converted_regexp_slot):
    return {"group_slot": converted_regexp_slot}


@pytest.fixture
def info_node(custom_response, custom_condition):
    return {
        "id": "1",
        "type": "default_node",
        "data": {
            "name": "test_node",
            "response": custom_response,
            "conditions": [custom_condition],
            "flags": ["start", "fallback"],
        },
    }


@pytest.fixture
def flow(info_node, group_slot):
    return {
        "name": "test_flow",
        "data": {
            "nodes": [
                info_node,
                {"type": "slots_node", "id": "test_slots_node_id", "data": {"groups": [group_slot]}},
            ],
            "edges": [{"source": "1", "sourceHandle": "1", "target": "1"}],
        },
    }


@pytest.fixture
def chatsky_node(converted_custom_response, converted_custom_condition):
    return {
        PRE_RESPONSE: {"fill": {"chatsky.processing.FillTemplate": None}},
        RESPONSE: converted_custom_response,
        TRANSITIONS: [{"dst": "dst_test_node", "priority": 1, "cnd": converted_custom_condition}],
        PRE_TRANSITION: {},
    }


@pytest.fixture
def mapped_flow(info_node):
    return {"test_flow": {"1": info_node}}


@pytest.fixture
def telegram_messenger(unique_build_token):
    return {"telegram": {}, "tg_token_name": unique_build_token}


@pytest.fixture
def chatsky_telegram_messenger(telegram_messenger):
    return {
        "chatsky.messengers.TelegramInterface": {"token": {"external:os.getenv": telegram_messenger["tg_token_name"]}}
    }
