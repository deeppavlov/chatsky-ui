import ast
from ast import NodeTransformer
from pathlib import Path
from typing import Dict, List

from chatsky_ui.core.logger_config import get_logger


class ServiceReplacer(NodeTransformer):
    """Replaces services' old codes in a given AST. For example, when a user changes a custom condition's
    code in the UI, the condition's code that is stored in the CUSTOM_FILE.CONDITIONS_FILE becomes outdated and
    needs to be updated. This class can do that.
    """

    def __init__(self, new_services: List[str]):
        """Creates an object of `ServiceReplacer` class, parses received service codes and saves them.
        If the code of a service isn't a class definition, logger gets an error and that service is ignored.

        Args:
            new_services (List[str]): The codes of services to replace their old codes.
        """
        self.new_services_classes = self._get_classes_def(new_services)
        self._logger = None

    @property
    def logger(self):
        """Returns this ServiceReplacer's `logger`. Raises ValueError if it isn't set."""
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    def _get_classes_def(self, services_code: List[str]) -> Dict[str, ast.ClassDef]:
        """Parses the services codes with 'ast.parse' and extracts all class definitions from the results.

        Args:
            services_code (List[str]): The codes of services to replace their old versions.
        Returns:
            Dict[str, ast.ClassDef]: A dictionary with all found classes' names as keys and respective codes as values.
        """
        parsed_codes = [ast.parse(service_code) for service_code in services_code]
        for idx, parsed_code in enumerate(parsed_codes):
            classes = self._extract_class_defs(parsed_code, services_code[idx])
        return classes

    def _extract_class_defs(self, parsed_code: ast.Module, service_code: str):
        """Returns all class definitions in a given `ast.Module`.

        Args:
            service_code (str): The code of the service being processed.
            parsed_code (ast.Module): Same, but it must be parsed through `ast.parse` first. If there are nodes which
                aren't 'ast.ClassDef', logger gets an error and the node is ignored.
        Returns:
            Dict[str, ast.ClassDef]: A dictionary with all found classes' names as keys and respective codes as values.
        """
        classes = {}
        for node in parsed_code.body:
            if isinstance(node, ast.ClassDef):
                classes[node.name] = node
            else:
                self.logger.error("No class definition found in new_service: %s", service_code)
        return classes

    def visit_ClassDef(self, node: ast.ClassDef) -> ast.ClassDef:
        """Checks if this ast.ClassDef node is supposed to be updated and, if so, replaces the old service code with
        the updated version, removing the service from the list of outdated services.
        Otherwise, it returns the node unchanged.
        """
        self.logger.debug("Visiting class '%s' and comparing with: %s", node.name, self.new_services_classes.keys())
        if node.name in self.new_services_classes:
            return self._get_class_def(node)
        return node

    def _get_class_def(self, node: ast.ClassDef) -> ast.ClassDef:
        """Returns the code of the service with the same name as this node.
        Removes the service from the list of outdated services.
        """
        service = self.new_services_classes[node.name]
        del self.new_services_classes[node.name]
        self.logger.info("Updating class '%s'", node.name)
        return service

    def generic_visit(self, node: ast.AST):
        """Gets called for nodes within the AST which aren't `ClassDef`s.
        Calls super().generic_visit(), which calls ast.visit() on all child nodes of this node.
        After every other node was processed, the top node ('ast.parse()' always returns ast.Module)
        will append all new services, which weren't already stored in the file. (When a known service is updated,
        it is deleted from the list in `_get_class_def`, so there are only unknown services left in that list.)
        """
        super().generic_visit(node)
        if isinstance(node, ast.Module) and self.new_services_classes:
            self._append_new_services(node)
        return node

    def _append_new_services(self, node: ast.Module):
        """Appends the new services to the given ast.Module node."""
        self.logger.info("Services not found, appending new services: %s", list(self.new_services_classes.keys()))
        for _, service in self.new_services_classes.items():
            node.body.append(service)


def store_custom_service(services_path: Path, services: List[str]):
    """Stores custom services, such as conditions or responses, into a given file.
    If the file isn't empty, it appends the new services to existing ones.
    It stores the data as an Abstract Syntax Tree.

    Args:
        services_path (Path): path to the file where the services should be stored.
        services (List[str]): A list of strings, each being the code of one of the services to store.
    """
    with open(services_path, "r", encoding="UTF-8") as file:
        conditions_tree = ast.parse(file.read())

    replacer = ServiceReplacer(services)
    replacer.set_logger()
    replacer.visit(conditions_tree)

    with open(services_path, "w") as file:
        file.write(ast.unparse(conditions_tree))


def get_all_classes(services_path):
    """Retrieves the code for all services stored in a given file.

    Args:
        services_path (Path): path to the file where the services are stored.
    Returns:
        A list of dictionaries with fields: "name" and "body" containing the names and the codes of all stored services.
    """
    with open(services_path, "r", encoding="UTF-8") as file:
        conditions_tree = ast.parse(file.read())

    return [
        {"name": node.name, "body": ast.unparse(node)}
        for node in conditions_tree.body
        if isinstance(node, ast.ClassDef)
    ]
