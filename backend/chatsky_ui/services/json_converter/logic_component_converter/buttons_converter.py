from typing import Optional
from ....schemas.front_graph_components.info_holders.response import ButtonResponse
from ....core.config import settings
from ....schemas.front_graph_components.info_holders.response import CustomResponse, TextResponse
from ..base_converter import BaseConverter
from ..consts import CUSTOM_FILE, RESPONSES_FILE
from .service_replacer import store_custom_service
from response_converter import BadResponseException


class ButtonsConverter(BaseConverter):
    """Converts frontend's `Buttons` into Chatsky `Buttons` for telegram.
    It does so by making Chatsky import the `AddButtons` class from Chatsky-UI,
    which is just a 'PRE_RESPONSE' processing function from Chatsky.
    """

    def __init__(self, buttons: dict):
        """Creates a `ButtonsConverter` object.

        Args:
            buttons (dict): The `Buttons` to be converted.

        Raises:
            BadResponseException: if the provided buttons don't have required fields.
        """
        try:
            self.button_type = self.determine_button_type(buttons)
            self.buttons = self.get_buttons_list(buttons, self.button_type)
        except KeyError as e:
            raise BadResponseException("Missing key in buttons data") from e

    def determine_button_type(self, buttons_dict: dict) -> Optional[str]:
        """Finds out if this node sends `inline` or `reply` buttons to the user.
        
        Raises: `KeyError`, if `buttons_dict` is a dictionary of the wrong structure.
        """
        if len(buttons_dict["exactMatch"]) > 0:
            return "reply"
        elif len(buttons_dict["hasCallback"]) > 0:
            return "inline"
        raise KeyError

    def get_buttons_list(self, button_dict: dict, button_type: Optional[str]) -> list:
        """Extracts buttons from the button_dict depending on the button type."""
        if button_type == "reply":
            return button_dict["exactMatch"]
        return button_dict["hasCallback"]

    def clean_buttons_list(self):
        """Cleans the unnecessary `id` key from every button (frontend uses it for it's own means,
        but we keep it clean to initialize `KeyboardButton`s)
        """
        for row in self.buttons:
            for button in row:
                button.pop("id", None)

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
        }[self.response.button_type]
        return {
            "external:chatsky_ui.clients.telegram_buttons.add_buttons": {
                "reply_markup": {keyboard_class: self.create_keyboard()},
            }
        }
