from chatsky_ui.services.process_manager import BuildManager, RunManager

build_manager = BuildManager()


def get_build_manager() -> BuildManager:
    build_manager.set_logger()
    return build_manager


run_manager = RunManager()


def get_run_manager() -> RunManager:
    run_manager.set_logger()
    return run_manager
