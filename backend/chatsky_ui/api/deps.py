from chatsky_ui.core.config import settings
from chatsky_ui.services.index import Index
from chatsky_ui.services.process_manager import BuildManager, RunManager
from chatsky_ui.services.websocket_manager import WebSocketManager

build_manager = BuildManager()


def get_build_manager() -> BuildManager:
    build_manager.set_logger()
    return build_manager


run_manager = RunManager()


def get_run_manager() -> RunManager:
    run_manager.set_logger()
    return run_manager


websocket_manager = WebSocketManager()


def get_websocket_manager() -> WebSocketManager:
    websocket_manager.set_logger()
    return websocket_manager


index = Index()


def get_index() -> Index:
    index.set_logger()
    index.set_path(settings.index_path)
    return index
