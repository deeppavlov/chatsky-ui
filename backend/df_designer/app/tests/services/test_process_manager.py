from random import randint

import pytest

from app.core.logger_config import get_logger
from app.services.process_manager import RunManager
from app.tests.confest import preset  # noqa: F401

logger = get_logger(__name__)


class TestRunManager:
    @pytest.mark.asyncio
    async def test_start(self, mocker, preset):  # noqa: F811
        build_id = 42

        # Mock the RunProcess constructor whereever it's called in
        # the process_manager file within the scope of this test function
        mock_run_process = mocker.patch("app.services.process_manager.RunProcess")
        mock_run_process_instance = mock_run_process.return_value
        mock_run_process_instance.start = mocker.AsyncMock()

        run_manager = RunManager()

        await run_manager.start(build_id, preset)

        mock_run_process.assert_called_once_with(run_manager.last_id, build_id, preset.end_status)

        mock_run_process_instance.start.assert_awaited_once_with(
            f"dflowd run_bot {build_id} --preset {preset.end_status}"
        )

        assert run_manager.processes[run_manager.last_id] is mock_run_process_instance

    @pytest.fixture(scope="session")
    def run_manager(self, preset):  # noqa: F811
        async def _run_manager():
            manager = RunManager()
            await manager.start(build_id=0, preset=preset)
            return manager

        return _run_manager

    @pytest.mark.asyncio
    async def test_stop_success(self, run_manager):
        manager = await run_manager()
        process_id = manager.get_last_id()
        await manager.stop(process_id)
        assert manager.processes[process_id].process.returncode == -15

    @pytest.mark.asyncio
    async def test_stop_with_error(self, run_manager):
        manager = await run_manager()
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
        assert isinstance(full_info, list) and isinstance(full_info[0], dict) and len(full_info) <= 10

    @pytest.mark.asyncio
    async def test_fetch_run_logs(self, run_manager):
        manager = await run_manager()
        logs = await manager.fetch_run_logs(22, 0, 10)  # TODO: change 22 to default id in env var
        assert isinstance(logs, list)
