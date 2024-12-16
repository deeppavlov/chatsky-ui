import ast
from ast import NodeTransformer
from pathlib import Path
from typing import Dict, List

from chatsky_ui.core.logger_config import get_logger


class ServiceReplacer(NodeTransformer):
    def __init__(self, new_services: List[str]):
        self.new_services_classes = self._get_classes_def(new_services)
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    def _get_classes_def(self, services_code: List[str]) -> Dict[str, ast.ClassDef]:
        parsed_codes = [ast.parse(service_code) for service_code in services_code]
        for idx, parsed_code in enumerate(parsed_codes):
            classes = self._extract_class_defs(parsed_code, services_code[idx])
        return classes

    def _extract_class_defs(self, parsed_code: ast.Module, service_code: str):
        classes = {}
        for node in parsed_code.body:
            if isinstance(node, ast.ClassDef):
                classes[node.name] = node
            else:
                self.logger.error("No class definition found in new_service: %s", service_code)
        return classes

    def visit_ClassDef(self, node: ast.ClassDef) -> ast.ClassDef:
        self.logger.debug("Visiting class '%s' and comparing with: %s", node.name, self.new_services_classes.keys())
        if node.name in self.new_services_classes:
            return self._get_class_def(node)
        return node

    def _get_class_def(self, node: ast.ClassDef) -> ast.ClassDef:
        service = self.new_services_classes[node.name]
        del self.new_services_classes[node.name]
        self.logger.info("Updating class '%s'", node.name)
        return service

    def generic_visit(self, node: ast.AST):
        super().generic_visit(node)
        if isinstance(node, ast.Module) and self.new_services_classes:
            self._append_new_services(node)
        return node

    def _append_new_services(self, node: ast.Module):
        self.logger.info("Services not found, appending new services: %s", list(self.new_services_classes.keys()))
        for _, service in self.new_services_classes.items():
            node.body.append(service)


def store_custom_service(services_path: Path, services: List[str]):
    with open(services_path, "r", encoding="UTF-8") as file:
        conditions_tree = ast.parse(file.read())

    replacer = ServiceReplacer(services)
    replacer.set_logger()
    replacer.visit(conditions_tree)

    with open(services_path, "w") as file:
        file.write(ast.unparse(conditions_tree))


def get_all_classes(services_path):
    with open(services_path, "r", encoding="UTF-8") as file:
        conditions_tree = ast.parse(file.read())

    return [
        {"name": node.name, "body": ast.unparse(node)}
        for node in conditions_tree.body
        if isinstance(node, ast.ClassDef)
    ]
