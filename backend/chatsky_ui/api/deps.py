from chatsky_ui.services.process_manager import BuildManager, RunManager
from chatsky_ui.services.sqlite_extractor import SQLiteExtractor

build_manager = BuildManager()


def get_build_manager() -> BuildManager:
    """Returns the only used instance of `build` process manager."""
    build_manager.set_logger()
    build_manager.set_bot_repo_manager()
    build_manager.set_graph_repo_manager()
    return build_manager


run_manager = RunManager()


def get_run_manager() -> RunManager:
    """Returns the only used instance of `run` process manager."""
    run_manager.set_logger()
    run_manager.set_bot_repo_manager()
    run_manager.set_graph_repo_manager()
    return run_manager


sql_extractor = SQLiteExtractor()


def get_sqlite_extractor() -> SQLiteExtractor:
    sql_extractor.set_logger()
    return sql_extractor
