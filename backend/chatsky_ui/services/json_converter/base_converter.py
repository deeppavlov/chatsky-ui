from abc import ABC, abstractmethod


class BaseConverter(ABC):
    """Base class for converting frontend's logic components and implementations
    of Chatsky core classes into actual Chatsky classes.
    """

    def __call__(self, *args, **kwargs):
        """Calling any `BaseConverter` will call `_convert` and thus return a converted object."""
        return self._convert()

    @abstractmethod
    def _convert(self):
        """Returns a fully converted object."""
        raise NotImplementedError
