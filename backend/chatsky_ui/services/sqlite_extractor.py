import sqlite3
from typing import Union

from chatsky import Context
from pydantic import ValidationError
from platform import system

from chatsky_ui.clients.context_storage import ChatskyUIContextStorage
from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger


class SQLiteExtractor:
    """Extracts `Context` objects from the SQLite database, that Chatsky uses as a `Context` storage.
    Provides methods for extracting specific data from the Chatsky database.
    """

    def __init__(self):
        self._logger = None
        self.connection = None
        self.database = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def get_database(self, run_id: int):
        separator = "///" if system() == "Windows" else "////"

        db_uri = f"sqlite+aiosqlite:{separator}{settings.database_path.absolute()}"
        if self.database == None:
            self.database = ChatskyUIContextStorage(db_uri, run_id)
        return self.database

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

    async def execute_statement(self, stmt: str, args: tuple = tuple()):
        try:
            self._ensure_connection()
            with self.connection as conn:
                cur = conn.cursor()
                cur.execute(stmt, args)
                rows = cur.fetchall()
                return rows
        except sqlite3.Error as e:
            self.logger.error(f"Database error: {e}")
            return None

    async def extract_chat_ids(self):
        return await self.execute_statement("SELECT id FROM chatsky_table_main")

    async def get_context(self, run_id: str, user_id: int):
        """Get the `Context` object for these run_id and user_id.
        In case there isn't a Context found, Context.connected() automatically creates
        an empty Context for those ids. In that case start_label == context.labels[0] == None,
        so we delete the new unnecessary Context and return None.
        """
        try:
            context = await Context.connected(self.get_database(run_id), id=user_id)
            if context.labels[0] == None:
                await context.delete()
                context = None
            return context
        except ValidationError:
            self.logger.error(
                "Extracted Context doesn't match the current Chatsky version's Context." "(it's probably outdated)"
            )
            return None

    async def fetch_chat_records(self, run_id: Union[int, str], user_id: int):
        context = await self.get_context(str(run_id), user_id)
        if context is None:
            raise ValueError("No context found for the given run_id and user_id.")
        requests = context.requests
        responses = context.responses
        result = []
        for user_request, bot_response in zip(await requests.values(), await responses.values()):
            result.append((user_request.text, bot_response.text))
        return result

    async def fetch_chat_ids(self):
        ids = await self.extract_chat_ids()
        if ids is None:
            raise ValueError("No chat records found in the database.")

        # ids = [item[0] for item in ids]
        return ids
