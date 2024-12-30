# import asyncio

# import pytest

# from chatsky_ui.core.config import settings
# from chatsky_ui.db.base import read_conf

# from chatsky_ui.schemas.process_status import Status


# class TestRunProcess:
#     @pytest.mark.asyncio
#     async def test_get_full_info(self, run_process):
#         process = await run_process("sleep 10000")
#         await asyncio.sleep(2)
#         info = await process.get_full_info(["status", "timestamp"])
#         assert info["status"] == Status.RUNNING.value

#     @pytest.mark.asyncio
#     @pytest.mark.parametrize(
#         "cmd_to_run, status",
#         [
#             ("sleep 10000", Status.RUNNING),
#             ("false", Status.FAILED),
#             ("echo Hello", Status.COMPLETED),
#         ],
#     )
#     async def test_check_status(self, run_process, cmd_to_run, status):
#         process = await run_process(cmd_to_run)
#         await asyncio.sleep(2)
#         assert await process.check_status() == status

#     @pytest.mark.asyncio
#     async def test_stop(self, run_process):
#         process = await run_process("sleep 10000")
#         await process.stop()
#         assert process.process.returncode == -15


# class TestBuildProcess:
#     @pytest.mark.asyncio
#     async def test_update_db_info(self, build_process, dummy_build_id):
#         process = await build_process("echo Hello")
#         await process.update_db_info()

#         builds_conf = await read_conf(settings.builds_path)
#         assert dummy_build_id in [conf["id"] for conf in builds_conf]  # type: ignore
