from typing import Optional

from ..base_converter import BaseConverter
from .response_converter import BadResponseException


class ButtonsConverter(BaseConverter):
    """Converts frontend's `Buttons` into Chatsky `Buttons` for telegram.
    It does so by making Chatsky import the `AddButtons` class from Chatsky-UI,
    which is just a 'PRE_RESPONSE' processing function from Chatsky.
    """

    def __init__(self, buttons_data: list):
        """Creates a `ButtonsConverter` object.

        Args:
            buttons (dict): The `Buttons` to be converted.

        Raises:
            BadResponseException: if the provided buttons don't have required fields.
        """
        try:
            self.buttons = buttons_data.get("buttons", None)
            self.button_type = self.determine_button_type(self.buttons)
        except KeyError as e:
            raise BadResponseException("Missing key in buttons data") from e

    def determine_button_type(self, buttons_list: list) -> Optional[str]:
        """Finds out if this node sends `inline` or `reply` buttons to the user.

        Raises: `KeyError`, if `buttons_dict` is a dictionary of the wrong structure.
        """
        if buttons_list[0][0].get("type", None) is "exactMatch":
            return "reply"
        else:
            return "inline"

    def clean_buttons_list(self):
        """Cleans the unnecessary `id` key from every button (frontend uses it for it's own means,
        but we keep it clean to initialize `KeyboardButton`s)
        """
        for row in self.buttons:
            for button in row:
                button.pop("id", None)
                button.pop("type", None)
                if self.button_type is "reply":
                    button.pop("callback", None)

    def create_keyboard(self) -> dict:
        """Creates a keyboard (list of lists of `Buttons`) for use in either a
        `ReplyKeyboardMarkup` or `InlineKeyboardMarkup` from `python-telegram-bot`.
        """
        button_class = {
            "inline": "external:telegram.InlineKeyboardButton",
            "reply": "external:telegram.KeyboardButton",
        }[self.button_type]

        self.clean_buttons_list()
        keyboard = [[{button_class: button} for button in row] for row in self.buttons]

        keyboard_name = "inline_keyboard" if self.button_type == "inline" else "keyboard"
        return {keyboard_name: keyboard}

    def _convert(self):
        """Converts the received `buttons` dict into Chatsky 'Buttons'."""
        keyboard_class = {
            "inline": "external:telegram.InlineKeyboardMarkup",
            "reply": "external:telegram.ReplyKeyboardMarkup",
        }[self.button_type]
        return {
            "external:chatsky_ui.clients.telegram_buttons.AddButtons": {
                "reply_markup": {keyboard_class: self.create_keyboard()},
            }
        }
