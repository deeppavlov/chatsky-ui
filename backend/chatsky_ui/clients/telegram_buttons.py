from typing import Any
from chatsky import BaseResponse, Context, MessageInitTypes
from chatsky import processing as proc

class AddButtons(proc.ModifyResponse, arbitrary_types_allowed=True):
    reply_markup: Any

    def __init__(self, reply_markup: Any):
        # basemodel does not allow positional arguments by default
        super().__init__(reply_markup=reply_markup)

    async def modified_response(
        self, original_response: BaseResponse, ctx: Context
    ) -> MessageInitTypes:
        result = await original_response(ctx)

        result.reply_markup = self.reply_markup
        return result
