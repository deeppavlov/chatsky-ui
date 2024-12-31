# from pathlib import Path

import pytest

# from omegaconf import OmegaConf


class TestRunManager:
    @pytest.mark.asyncio
    async def test_stop_with_error(self, run_manager, inexistent_id):
        with pytest.raises((RuntimeError, ProcessLookupError)):
            await run_manager.stop(inexistent_id)

    # @pytest.mark.asyncio
    # async def test_stop_all():
    #     pass

    # def test_check_status(self, run_manager, preset):
    #     pass

    # @pytest.mark.asyncio
    # async def test_get_process_info(self, mocker, run_manager):
    #     df_conf = OmegaConf.create(
    #         f"""
    #         - id: {RUN_ID}
    #           status: stopped
    #     """
    #     )
    #     df_conf_dict = {
    #         "id": RUN_ID,
    #         "status": "stopped",
    #     }

    #     read_conf = mocker.patch("chatsky_ui.services.process_manager.read_conf")
    #     read_conf.return_value = df_conf

    #     run_info = await run_manager.get_run_info(RUN_ID)
    #     assert run_info == df_conf_dict

    # @pytest.mark.asyncio
    # async def test_update_db_n_fetch_run_logs(self, run_process, dummy_run_id, run_manager):
    #     process = await run_process("echo Hello")
    #     process.logger.info("test log")
    #     await process.update_db_info()

    #     logs = await run_manager.fetch_run_logs(dummy_run_id, 0, 10)

    #     assert any(["test log" in log for log in logs])
