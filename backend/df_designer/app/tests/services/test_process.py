import asyncio

import pytest

from app.core.logger_config import get_logger
from app.services.process import RunProcess

logger = get_logger(__name__)


class TestRunProcess:
    @pytest.fixture(scope="session")
    def run_process(self):
        async def _run_process(cmd_to_run):
            process = RunProcess(id_=0)
            await process.start(cmd_to_run)
            return process

        return _run_process

    # def test_update_db_info(self, run_process):
    #     process = await run_process("echo 'Hello df_designer'")
    #     process.update_db_info()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "cmd_to_run, status",
        [
            ("sleep 10000", "running"),
            ("bash -c 'exit 1'", "failed"),
            ("echo 'Hello df_designer'", "completed"),
        ],
    )
    async def test_check_status(self, run_process, cmd_to_run, status):
        process = await run_process(cmd_to_run)
        await asyncio.sleep(2)
        assert process.check_status() == status

    # def test_periodically_check_status(self, run_process):
    #     process = await run_process("sleep 10000")
    #     run_process.periodically_check_status()

    @pytest.mark.asyncio
    async def test_stop(self, run_process):
        process = await run_process("sleep 10000")
        await process.stop()
        assert process.process.returncode == -15

    @pytest.mark.asyncio
    async def test_read_stdout(self, run_process):
        process = await run_process("echo Hello df_designer")
        output = await process.read_stdout()
        assert output.strip().decode() == "Hello df_designer"

    @pytest.mark.asyncio
    async def test_write_stdout(self, run_process):
        process = await run_process("cat")
        await process.write_stdin(b"DF_Designer team welcome you.\n")
        output = await process.process.stdout.readline()
        assert output.decode().strip() == "DF_Designer team welcome you."


# class TestBuildProcess:
#     pass
