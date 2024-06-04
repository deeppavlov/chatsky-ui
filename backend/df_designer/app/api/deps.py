from app.clients.process_manager import ProcessManager
from app.clients.websocket_manager import WebSocketManager

process_manager = ProcessManager()
def get_process_manager() -> ProcessManager:
    return process_manager

websocket_manager = WebSocketManager()
def get_websocket_manager() -> WebSocketManager:
    return websocket_manager
