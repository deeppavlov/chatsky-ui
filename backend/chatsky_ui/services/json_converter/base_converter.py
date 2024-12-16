from abc import ABC, abstractmethod


class BaseConverter(ABC):
    def __call__(self, *args, **kwargs):
        return self._convert()

    @abstractmethod
    def _convert(self):
        raise NotImplementedError
