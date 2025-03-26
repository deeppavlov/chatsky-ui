import sqlite3
from platform import system
from typing import Union

from chatsky import Context
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger


class SQLiteExtractor:
    """Extracts `Context` objects from the SQLite database, that Chatsky uses as a `Context` storage.
    Provides methods for extracting specific data from the Chatsky database.
    """

    def __init__(self):
        self._logger = None
        self.engine = create_async_engine(self.get_sqlite_uri(), pool_pre_ping=True)

    def get_sqlite_uri(self):
        separator = "///" if system() == "Windows" else "////"
        return f"sqlite+aiosqlite:{separator}{settings.database_path.absolute()}"

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    async def extract_user_context(self, run_id: str, user_id: int):
        try:
            ctx_id = f"{run_id}_{user_id}"
            async with self.engine.connect() as conn:
                stmt = select(self.table.c.context).where(self.table.c.id == ctx_id)
                result = await conn.execute(stmt)
                rows = result.fetchall()
                return rows
        except sqlite3.Error:
            self.logger.error("Connection to db failed or database structure is too different.")
            return None

    async def get_context(self, run_id: str, user_id: int):
        try:
            query_result = await self.extract_user_context(run_id, user_id)
            (id, context) = query_result[0]
            return Context.model_validate_json(context)
        except ValidationError:
            self.logger.error(
                "Extracted Context doesn't match the current Chatsky version's Context." "(it's probably outdated)"
            )
            return None

    async def fetch_chat_records(self, run_id: Union[int, str], user_id: int, offset: int, limit: int):
        context = await self.get_context(str(run_id), user_id)
        requests = context.requests
        responses = context.responses
        result = []
        for user_request, bot_response in zip(requests.values(), responses.values()):
            result.append((user_request.text, bot_response.text))
        return result
