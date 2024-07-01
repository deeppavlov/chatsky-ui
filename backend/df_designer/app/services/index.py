"""
Index service
-------------

The Index service is responsible for indexing the user bot's conditions, responses, and services.
By indexing the project, the Index service creates an in-memory representation that can be
quickly accessed when needed.
"""
import asyncio
from pathlib import Path
from typing import Dict, List, Optional

from omegaconf import OmegaConf
from omegaconf.dictconfig import DictConfig

from app.core.config import settings
from app.core.logger_config import get_logger
from app.db.base import read_conf, read_logs, write_conf


class Index:
    def __init__(self):
        self.path: Path = settings.index_path
        self.index: dict = {}
        self.conditions: List[str] = []
        self.responses: List[str] = []
        self.services: List[str] = []
        self.logger = get_logger(__name__)

    async def _load_index(self) -> None:
        """Load indexed conditions, responses and services from disk."""
        db_index: DictConfig = await read_conf(self.path)  # type: ignore
        index_dict: Dict[str, dict] = OmegaConf.to_container(db_index, resolve=True)  # type: ignore
        self.index = index_dict
        self.logger.debug("Index loaded")

    async def _load_conditions(self) -> None:
        """Load conditions from disk."""
        path = self.path.parent / "conditions.py"
        if path.exists():
            self.conditions = await read_logs(path)
            self.logger.debug("Conditions loaded")
        else:
            self.logger.warning("No conditions file found")

    async def _load_responses(self) -> None:
        """Load responses from disk."""
        path = self.path.parent / "responses.py"
        if path.exists():
            self.responses = await read_logs(path)
            self.logger.debug("Responses loaded")
        else:
            self.logger.warning("No responses file found")

    async def _load_services(self) -> None:
        """Load services from disk."""
        path = self.path.parent / "services.py"
        if path.exists():
            self.services = await read_logs(path)
            self.logger.debug("Services loaded")
        else:
            self.logger.warning("No services file found")

    def _get_service_code(self, services_lst: List[str], lineno: int) -> List[str]:
        """Get service code from services list.

        Example:
            >>> _get_service_code(["def is_upper_case(name):\n", "    return name.isupper()"], 1)
            ['def is_upper_case(name):\n', '    return name.isupper()']
        """
        service: List[str] = []
        func_lines: List[str] = services_lst[lineno - 1 :]
        self.logger.debug("services_lst: %s", services_lst)
        for func_lineno, func_line in enumerate(func_lines):
            if func_line.startswith("def ") and func_lineno != 0:
                break
            service.append(func_line)  # ?maybe with \n
        return service

    async def load(self) -> None:
        """Load index and services into memory."""
        if not self.path.exists():
            raise FileNotFoundError(f"File {self.path} doesn't exist")

        await asyncio.gather(
            self._load_index(),
            self._load_conditions(),
            self._load_responses(),
            self._load_services(),
        )
        self.logger.info("Index and services loaded")
        self.logger.debug("Loaded index: %s", self.index)

    def get_services(self) -> dict:
        """Get indexed services.

        Example:
            >>> get_services()
            {
                "is_upper_case": {"type": "condition", "lineno": 3},
                "say_hi": {"type": "response", "lineno": 5}
            }
        """
        return self.index

    async def search_service(self, service_name: str) -> Optional[List[str]]:
        """Get the body code of a service based on its indexed info (type, lineno).

        Example:
            >>> search_service("is_upper_case")
            ["def is_upper_case(name):\n", "    return name.isupper()"]

        """
        if service_name not in self.index:
            return []
        service_type = self.index[service_name]["type"]
        lineno = int(self.index[service_name]["lineno"])

        if service_type == "condition":
            return self._get_service_code(self.conditions, lineno)
        elif service_type == "response":
            return self._get_service_code(self.responses, lineno)
        elif service_type == "service":
            return self._get_service_code(self.services, lineno)

    async def indexit(self, service_name: str, type_: str, lineno: int) -> None:
        """Add service info to the index using indexit_all method."""
        self.logger.debug("Indexing '%s'", service_name)
        await self.indexit_all([service_name], [type_], [lineno])
        self.logger.info("Indexed '%s'", service_name)

    async def indexit_all(self, services_names: List[str], types: List[str], linenos: List[int]) -> None:
        """Index multiple services.

        The index is added to the index in the form: {service_name: {"type": ``type_``, "lineno": lineno}}.

        Args:
            services_names: list of service names
            types: list of service types ("condition", "response", "service")
            linenos: list of service starting line numbers according to its place in the file.

        Raises:
            FileNotFoundError: if the index file doesn't exist

        Example:
            >>> services_names = ["is_upper_case", "say_hi"]
            >>> types = ["condition", "response"]
            >>> linenos = [3, 5]
            >>> await indexit_all(services_names, types, linenos)
            {
                "is_upper_case": {"type": "condition", "lineno": 3},
                "say_hi": {"type": "response", "lineno": 5}
            }

        Returns:
            None
        """
        if not self.path.exists():
            raise FileNotFoundError(f"File {self.path} doesn't exist")

        for service_name, type_, lineno in zip(services_names, types, linenos):
            self.index[service_name] = {
                "type": type_,  # condition/response/service
                "lineno": lineno,
            }

        await write_conf(self.index, self.path)  # ?to background tasks
