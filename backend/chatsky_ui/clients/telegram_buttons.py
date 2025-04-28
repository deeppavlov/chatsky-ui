from typing import Any

from chatsky import BaseResponse, Context, MessageInitTypes
from chatsky import processing as proc
from telegram import ReplyKeyboardRemove, ReplyKeyboardMarkup, InlineKeyboardMarkup

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
            ctx.current_node.misc["telegram_reply_keyboard_state"] = "working"

        elif isinstance(self.reply_markup, InlineKeyboardMarkup):
            telegram_reply_keyboard_state = ctx.current_node.misc.get("telegram_reply_keyboard_state", None)
            if telegram_reply_keyboard_state == "being removed":
                self.loud_keyboard_removal(ctx)

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
            chat_id=ctx.id,
            text="...",
            reply_markup=ReplyKeyboardRemove(),
            disable_notification=True
        )


class RemoveButtons(proc.ModifyResponse, arbitrary_types_allowed=True):
    """Deletes the Reply Keyboard from a Telegram chat.
    In case a ReplyKeyboard changes right into InlineKeyboard, `AddButtons` handles
    that special case right before adding InlineKeyboard.
    """
    async def modified_response(self, original_response: BaseResponse, ctx: Context) -> MessageInitTypes:
        result = await original_response(ctx)

        telegram_reply_keyboard_state = ctx.current_node.misc.get("telegram_reply_keyboard_state", None)
        if telegram_reply_keyboard_state == "working":
            ctx.current_node.misc["telegram_reply_keyboard_state"] = "being removed"
        elif telegram_reply_keyboard_state == "being removed":
            ctx.current_node.misc["telegram_reply_keyboard_state"] = None

        result.reply_markup = ReplyKeyboardRemove()
        return result
