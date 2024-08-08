import pytest
from pathlib import Path
from omegaconf import OmegaConf

from app.core.logger_config import get_logger

logger = get_logger(__name__)

RUN_ID = 42
BUILD_ID = 43


class TestRunManager:
    @pytest.mark.asyncio
    async def test_start(self, mocker, preset, run_manager):  # noqa: F811
        # Mock the RunProcess constructor whereever it's called in
        # the process_manager file within the scope of this test function
        run_process = mocker.patch("app.services.process_manager.RunProcess")
        run_process_instance = run_process.return_value
        run_process_instance.start = mocker.AsyncMock()
        run_manager.get_full_info = mocker.AsyncMock(return_value=[{"id": RUN_ID}])

        await run_manager.start(build_id=BUILD_ID, preset=preset)

        run_process.assert_called_once_with(run_manager.last_id, BUILD_ID, preset.end_status)
        run_process_instance.start.assert_awaited_once_with(f"dflowd run_bot {BUILD_ID} --preset {preset.end_status}")

        assert run_manager.processes[run_manager.last_id] is run_process_instance

    @pytest.mark.asyncio
    async def test_stop_success(self, mocker, run_manager):
        run_manager.processes[RUN_ID] = mocker.MagicMock()
        run_manager.processes[RUN_ID].stop = mocker.AsyncMock()

        await run_manager.stop(RUN_ID)
        run_manager.processes[RUN_ID].stop.assert_awaited_once_with()

    @pytest.mark.asyncio
    async def test_stop_with_error(self, run_manager):
        with pytest.raises((RuntimeError, ProcessLookupError)):
            await run_manager.stop(RUN_ID)

    # def test_check_status(self, run_manager, preset):
    # pass

    @pytest.mark.asyncio
    async def test_get_process_info(self, mocker, run_manager):
        df_conf = OmegaConf.create(
            f"""
            - id: {RUN_ID}
              status: stopped
        """
        )
        df_conf_dict = {
            "id": RUN_ID,
            "status": "stopped",
        }

        read_conf = mocker.patch("app.services.process_manager.read_conf")
        read_conf.return_value = df_conf

        run_info = await run_manager.get_run_info(RUN_ID)
        assert run_info == df_conf_dict

    @pytest.mark.asyncio
    async def test_get_full_info(self, mocker, run_manager):
        df_conf = OmegaConf.create(
            f"""
            - id: {RUN_ID}
              status: stopped
            - id: {RUN_ID + 1}
              status: stopped
        """
        )
        df_conf_dict = {
            "id": RUN_ID,
            "status": "stopped",
        }

        read_conf = mocker.patch("app.services.process_manager.read_conf")
        read_conf.return_value = df_conf

        run_info = await run_manager.get_full_info(0, 1)
        assert run_info == [df_conf_dict]

    @pytest.mark.asyncio
    async def test_fetch_run_logs(self, mocker, run_manager):
        LOG_PATH = Path("df_designer/logs/runs/20240425/42_211545.log")
        run_manager.get_process_info = mocker.AsyncMock(return_value={"id": RUN_ID, "log_path": LOG_PATH})

        read_logs = mocker.patch("app.services.process_manager.read_logs", return_value=["log1", "log2"])

        logs = await run_manager.fetch_run_logs(RUN_ID, 0, 1)

        run_manager.get_process_info.assert_awaited_once()
        read_logs.assert_awaited_once_with(LOG_PATH)
        assert logs == ["log1"]
