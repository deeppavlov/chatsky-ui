from random import randint

import pytest
from app.core.logger_config import get_logger
from app.schemas.preset import Preset
from app.services.process_manager import RunManager

logger = get_logger(__name__)


class TestRunManager:
    @pytest.fixture(scope="session")
    def preset(self):
        return Preset(
            wait_time=0,
            end_status="loop",
        )

    @pytest.fixture(scope="session")
    def run_manager(self, preset):
        async def _run_manager():
            manager = RunManager()
            await manager.start(build_id=0, preset=preset)
            return manager

        return _run_manager

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status", ["success", "with_error"])
    async def test_stop(self, run_manager, status):
        manager = await run_manager()
        if status == "success":
            process_id = manager.get_last_id()
            await manager.stop(process_id)
            assert manager.processes[process_id].process.returncode == -15
        else:
            process_id = randint(1000, 2000)
            with pytest.raises((RuntimeError, ProcessLookupError)):
                await manager.stop(process_id)

    # def test_check_status(self, run_manager, preset):
    # pass

    @pytest.mark.asyncio
    async def test_get_process_info(self, run_manager):
        manager = await run_manager()
        run_info = await manager.get_run_info(22)  # TODO: change 22 to default id in env var
        assert isinstance(run_info, dict) and "id" in run_info

    @pytest.mark.asyncio
    async def test_get_full_info(self, run_manager):
        manager = await run_manager()
        full_info = await manager.get_full_info(0, 10)
        assert isinstance(full_info, list) and isinstance(full_info[0], dict) and len(full_info) == 10

    @pytest.mark.asyncio
    async def test_fetch_run_logs(self, run_manager):
        manager = await run_manager()
        logs = await manager.fetch_run_logs(22, 0, 10)  # TODO: change 22 to default id in env var
        assert isinstance(logs, list)
