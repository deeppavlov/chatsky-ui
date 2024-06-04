from app.clients.process_manager import ProcessManager
from app.clients.websocket_manager import WebSocketManager

build_manager = ProcessManager()
def get_build_manager() -> ProcessManager:
    return build_manager

run_manager = ProcessManager()
def get_run_manager() -> ProcessManager:
    return run_manager

websocket_manager = WebSocketManager()
def get_websocket_manager() -> WebSocketManager:
    return websocket_manager
