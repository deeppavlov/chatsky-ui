import sqlite3
from typing import Union

from chatsky import Context
from pydantic import ValidationError

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger


class SQLiteExtractor:
    """Extracts `Context` objects from the SQLite database, that Chatsky uses as a `Context` storage.
    Provides methods for extracting specific data from the Chatsky database.
    """

    def __init__(self):
        self._logger = None
        self.connection = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    def _ensure_connection(self):
        """Ensure the SQLite connection is active and valid, with up to three reconnection attempts."""
        if self.connection is None:
            self.connection = sqlite3.connect(f"{settings.database_path}")
        attempts = 0
        while attempts < 3:
            try:
                self.logger.info("Checking connection to the database...")
                self.connection.execute("SELECT 1")  # Simple query to check connection
                return
            except sqlite3.Error:
                self.logger.warning(f"Lost connection to the database. Reconnecting... (Attempt {attempts + 1}/3)")
                self.connection = sqlite3.connect(f"{settings.database_path}")
                attempts += 1
        raise sqlite3.Error("Failed to reconnect to the database after 3 attempts.")

    async def extract_user_context(self, run_id: str, user_id: int):
        try:
            self._ensure_connection()
            ctx_id = f"{run_id}_{user_id}"
            with self.connection as conn:
                cur = conn.cursor()
                cur.execute("SELECT * FROM contexts WHERE id = ?", (ctx_id,))
                rows = cur.fetchall()
                return rows
        except sqlite3.Error as e:
            self.logger.error(f"Database error: {e}")
            return None

    async def get_context(self, run_id: str, user_id: int):
        try:
            query_result = await self.extract_user_context(run_id, user_id)
            if query_result is None or len(query_result) == 0:
                self.logger.error("No context found for the given run_id and user_id.")
                return None
            (id, context) = query_result[0]
            return Context.model_validate_json(context)
        except ValidationError:
            self.logger.error(
                "Extracted Context doesn't match the current Chatsky version's Context." "(it's probably outdated)"
            )
            return None

    async def fetch_chat_records(self, run_id: Union[int, str], user_id: int, offset: int, limit: int):
        context = await self.get_context(str(run_id), user_id)
        if context is None:
            raise ValueError("No context found for the given run_id and user_id.")
        requests = context.requests
        responses = context.responses
        result = []
        for user_request, bot_response in zip(requests.values(), responses.values()):
            result.append((user_request.text, bot_response.text))
        return result

    async def fetch_message_label(self, run_id: Union[int, str], user_id: int, message_id: int):
        """Gets the node label of the current Chatsky turn."""
        context = await self.get_context(str(run_id), user_id)
        if context is None:
            raise ValueError("No context found for the given run_id and user_id.")
        label = context.labels.get(message_id, None)
        if label is not None:
            return {"flow_name": label.flow_name, "node_name": label.node_name}
        return None
