import asyncio

from omegaconf import OmegaConf

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, read_logs, write_conf


class Index:
    def __init__(self):
        self.path = settings.index_path
        self.index = {}
        self.conditions = []
        self.responses = []
        self.services = []
        self.logger = get_logger(__name__)

        if not self.path.exists():
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.touch()

    async def _load_index(self):
        db_index = await read_conf(self.path)
        index_dict = OmegaConf.to_container(db_index, resolve=True)
        self.index = index_dict
        self.logger.debug("Index loaded")

    async def _load_conditions(self):
        if (path := self.path.parent / "conditions.py").exists():
            self.conditions = await read_logs(path)
            self.logger.debug("Conditions loaded")
        else:
            self.logger.warning("No conditions file found")

    async def _load_responses(self):
        if (path := self.path.parent / "responses.py").exists():
            self.responses = await read_logs(path)
            self.logger.debug("Responses loaded")
        else:
            self.logger.warning("No responses file found")

    async def _load_services(self):
        if (path := self.path.parent / "services.py").exists():
            self.services = await read_logs(path)
            self.logger.debug("Services loaded")
        else:
            self.logger.warning("No services file found")

    def _get_service(self, services_lst: list, lineno: int):
        service = []
        func_lines = services_lst[lineno - 1 :]
        self.logger.debug("services_lst: %s", services_lst)
        for func_lineno, func_line in enumerate(func_lines):
            if func_line[:4] == "def " and func_lineno != 0:
                break
            service.append(func_line)  # ?maybe with \n
        return service

    async def load(self):
        """load index and services into memory"""
        await asyncio.gather(
            self._load_index(),
            self._load_conditions(),
            self._load_responses(),
            self._load_services(),
        )
        self.logger.info("Index and services loaded")
        self.logger.debug("Loaded index: %s", self.index)

    def get_services(self):
        return self.index

    async def search_service(self, service_name):
        if service_name not in self.index:
            return []
        type_ = self.index[service_name]["type"]
        lineno = int(self.index[service_name]["lineno"])

        if type_ == "condition":
            return self._get_service(self.conditions, lineno)
        elif type_ == "response":
            return self._get_service(self.responses, lineno)
        elif type_ == "service":
            return self._get_service(self.services, lineno)

    async def indexit(self, service_name: str, type_, lineno):
        self.logger.debug("Indexing '%s'", service_name)
        # TODO: if service_name in self.index update it
        self.index[service_name] = {
            "type": type_,  # condition/response/service
            "lineno": lineno,
        }

        await write_conf(self.index, self.path)  # ?to background tasks
        self.logger.info("Indexed '%s'", service_name)
