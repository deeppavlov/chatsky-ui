import ast
from ast import NodeTransformer
from typing import Dict, List

from chatsky_ui.core.logger_config import get_logger

logger = get_logger(__name__)


class ServiceReplacer(NodeTransformer):
    def __init__(self, new_services: List[str]):
        self.new_services_classes = self._get_classes_def(new_services)

    def _get_classes_def(self, services_code: List[str]) -> Dict[str, ast.ClassDef]:
        parsed_codes = [ast.parse(service_code) for service_code in services_code]
        result_nodes = {}
        for idx, parsed_code in enumerate(parsed_codes):
            self._extract_class_defs(parsed_code, result_nodes, services_code[idx])
        return result_nodes

    def _extract_class_defs(self, parsed_code: ast.Module, result_nodes: Dict[str, ast.ClassDef], service_code: str):
        for node in parsed_code.body:
            if isinstance(node, ast.ClassDef):
                result_nodes[node.name] = node
            else:
                logger.error("No class definition found in new_service: %s", service_code)

    def visit_ClassDef(self, node: ast.ClassDef) -> ast.ClassDef:
        logger.debug("Visiting class '%s' and comparing with: %s", node.name, self.new_services_classes.keys())
        if node.name in self.new_services_classes:
            return self._get_class_def(node)
        return node

    def _get_class_def(self, node: ast.ClassDef) -> ast.ClassDef:
        service = self.new_services_classes[node.name]
        del self.new_services_classes[node.name]
        return service

    def generic_visit(self, node: ast.AST):
        super().generic_visit(node)
        if isinstance(node, ast.Module) and self.new_services_classes:
            self._append_new_services(node)
        return node

    def _append_new_services(self, node: ast.Module):
        logger.info("Services not found, appending new services: %s", list(self.new_services_classes.keys()))
        for _, service in self.new_services_classes.items():
            node.body.append(service)
