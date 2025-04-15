"""
Chatsky-UI Context Storage
---
In Chatsky-UI, ctx_id = `run_id` + "_" + `user_id`, where `ctx_id` is the resulting id stored in the SQLite database,
`run_id` is the id of the Chatsky-UI `Run` process and `user_id` is what Chatsky would use as the `ctx_id` by default,
but we added the `run_id` in the beginning to differentiate between, say, Telegram and Whatsapp users
(so that their user_id's wouldn't intersect).
"""

from typing import List, Optional, Tuple

from chatsky.context_storages import SQLContextStorage
from chatsky.core.ctx_utils import ContextMainInfo


class ChatskyUIContextStorage(SQLContextStorage):
    """A 'wrapper' class for all methods using `ctx_id`, making them use composite id's."""

    def __init__(self, path: str, run_id: int, **kwargs):
        self.run_id = str(run_id)
        super().__init__(path, **kwargs)

    def get_ctx_id(self, user_id: str) -> str:
        """Formats `ctx_id` to how the context id's are stored in the Chatsky-UI database."""
        return f"{self.run_id}_{user_id}"

    async def _load_main_info(self, user_id: str) -> Optional[ContextMainInfo]:
        return await super()._load_main_info(self.get_ctx_id(user_id))

    async def _update_context(
        self,
        user_id: str,
        ctx_info: Optional[ContextMainInfo],
        field_info: List[Tuple[str, List[Tuple[int, Optional[bytes]]]]],
    ) -> None:
        await super()._update_context(self.get_ctx_id(user_id), ctx_info, field_info)

    async def _delete_context(self, user_id: str) -> None:
        await super()._delete_context(self.get_ctx_id(user_id))

    async def _load_field_latest(self, user_id: str, field_name: str) -> List[Tuple[int, bytes]]:
        return await super()._load_field_latest(self.get_ctx_id(user_id), field_name)

    async def _load_field_keys(self, user_id: str, field_name: str) -> List[int]:
        return await super()._load_field_keys(self.get_ctx_id(user_id), field_name)

    async def _load_field_items(self, user_id: str, field_name: str, keys: List[int]) -> List[Tuple[int, bytes]]:
        return await super()._load_field_items(self.get_ctx_id(user_id), field_name, keys)
