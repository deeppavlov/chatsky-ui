from typing import Any

from chatsky import BaseResponse, Context, MessageInitTypes
from chatsky import processing as proc
from telegram import InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove


class AddButtons(proc.ModifyResponse, arbitrary_types_allowed=True):
    """Adds given Telegram buttons to a Chatsky message. Also handles button deletion in case
    ReplyKeyboardMarkup changes right into InlineKeyboardMarkup (it really does need special handling,
    there just isn't a pretty way to do this)
    """

    reply_markup: Any

    def __init__(self, reply_markup: Any):
        # basemodel does not allow positional arguments by default
        super().__init__(reply_markup=reply_markup)

    async def modified_response(self, original_response: BaseResponse, ctx: Context) -> MessageInitTypes:
        result = await original_response(ctx)

        result.reply_markup = self.reply_markup

        if isinstance(self.reply_markup, ReplyKeyboardMarkup):
            ctx._storage.telegram_keyboard_states[ctx.id] = "working"

        elif isinstance(self.reply_markup, InlineKeyboardMarkup):
            keyboard_state = ctx._storage.telegram_keyboard_states.get(ctx.id, None)
            if keyboard_state == "being removed":
                await self.loud_keyboard_removal(ctx)

        return result

    async def loud_keyboard_removal(self, ctx: Context):
        """Sends a message to a Telegram chat with the text being just '...'.
        It's done to remove the ReplyKeyboardMarkup from the chat.
        It has to be done, because Telegram doesn't allow both sending an InlineKeyboard and
        removing an older ReplyKeyboardMarkup in the same message. Telegram also doesn't allow 'silent'
        messages with no text so this has to be a 'loud' method.
        """
        messenger_interface = ctx.pipeline.messenger_interface
        bot = messenger_interface.application.bot
        await bot.send_message(
            chat_id=ctx.id, text="...", reply_markup=ReplyKeyboardRemove(), disable_notification=True
        )


class RemoveButtons(proc.ModifyResponse, arbitrary_types_allowed=True):
    """Deletes the Reply Keyboard from a Telegram chat.
    In case a ReplyKeyboard changes right into InlineKeyboard, `AddButtons` handles
    that special case right before adding InlineKeyboard.
    """

    async def modified_response(self, original_response: BaseResponse, ctx: Context) -> MessageInitTypes:
        result = await original_response(ctx)

        keyboard_state = ctx._storage.telegram_keyboard_states.get(ctx.id, None)
        if keyboard_state == "working":
            ctx._storage.telegram_keyboard_states[ctx.id] = "being removed"
        elif keyboard_state == "being removed":
            ctx._storage.telegram_keyboard_states[ctx.id] = None

        result.reply_markup = ReplyKeyboardRemove()

        return result
