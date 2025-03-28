"""
Chatsky-UI Context Storage
---
In Chatsky-UI, ctx_id = `run_id` + "_" + `user_id`, where `ctx_id` is the resulting id stored in the SQLite database,
`run_id` is the id of the Chatsky-UI `Run` process and `user_id` is what Chatsky would use as the `ctx_id` by default,
but we added the `run_id` in the beginning to differentiate between, say, Telegram and Whatsapp users
(so that their user_id's wouldn't intersect).
"""

from typing import Hashable

from chatsky.context_storages import SQLContextStorage
from chatsky.core import Context


class ChatskyUIContextStorage(SQLContextStorage):
    """A 'wrapper' class for all methods using `ctx_id`, making them use composite id's."""

    def __init__(self, path: str, run_id: int, **kwargs):
        self.run_id = run_id
        super().__init__(path, **kwargs)

    def get_ctx_id(self, key: Hashable):
        """Formats `ctx_id` to how the context id's are stored in the Chatsky-UI database."""
        return f"{self.run_id}_{str(key)}"

    async def set_item_async(self, key: Hashable, value: Context):
        await super().set_item_async(self.get_ctx_id(key), value)

    async def get_item_async(self, key: Hashable) -> Context:
        return await super().get_item_async(self.get_ctx_id(key))

    async def del_item_async(self, key: Hashable):
        await super().del_item_async(self.get_ctx_id(key))

    async def contains_async(self, key: Hashable) -> bool:
        return await super().contains_async(self.get_ctx_id(key))
