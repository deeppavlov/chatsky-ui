import pytest

from ...services.sqlite_extractor import SQLiteExtractor


class TestSQLiteExtractor:
    @pytest.mark.asyncio
    async def test_fetch_chat_records(self, dummy_run_id):
        user_id = 0
        test_result = [
            ("hello", "Do you want a pizza?"),
            ("yes", "Some cheese in pizza?"),
            ("no", "Okay, so, your order is coming!"),
            ("/start", "Oops, something wrong happened"),
            ("/start", "Hello!"),
            ("hello", "Do you want a pizza?"),
            ("bye", "Oops, something wrong happened"),
        ]
        sqlite_extractor = SQLiteExtractor()
        sqlite_extractor.set_logger()
        response = await sqlite_extractor.fetch_chat_records(dummy_run_id, user_id)
        assert test_result == response
