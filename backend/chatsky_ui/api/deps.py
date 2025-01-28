from chatsky_ui.services.process_manager import BuildManager, RunManager

build_manager = BuildManager()


def get_build_manager() -> BuildManager:
    build_manager.set_logger()
    build_manager.set_bot_repo_manager()
    build_manager.set_graph_repo_manager()
    return build_manager


run_manager = RunManager()


def get_run_manager() -> RunManager:
    run_manager.set_logger()
    run_manager.set_bot_repo_manager()
    run_manager.set_graph_repo_manager()
    return run_manager
