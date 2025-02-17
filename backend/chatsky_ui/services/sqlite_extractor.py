import sqlite3

from chatsky_ui.core.config import settings
from chatsky_ui.core.logger_config import get_logger

from chatsky import Context
from pydantic import ValidationError


class SQLiteExtractor:
    """Extracts `Context` objects from the SQLite database, that Chatsky uses as a `Context` storage.
    Provides methods for extracting specific data from the Chatsky database.
    """

    def __init__(self):
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    def extract_user_context(self, run_id: int, user_id: int):
        try:
            database = settings.context_storage_dir + f"/run_{run_id}.db"
            with sqlite3.connect(database) as conn:
                cur = conn.cursor()
                cur.execute('SELECT * FROM contexts WHERE id = ?', (user_id,))
                rows = cur.fetchall()
                return rows
        except sqlite3.Error as e:
            print(e)

    def get_context(self, run_id: int, user_id: int):
        try:
            query_result = self.extract_user_context(run_id, user_id)
            (id, context) = query_result[0]
            return Context.model_validate_json(context)
        except ValidationError as e:
            # In case a database is old (Chatsky `Context` was updated since then), this may throw an error.
            print(e)

    def fetch_chat_records(self, run_id: int, user_id: int, offset: int, limit: int):
        context = self.get_context(run_id, user_id)
        return context.responses, context.requests
