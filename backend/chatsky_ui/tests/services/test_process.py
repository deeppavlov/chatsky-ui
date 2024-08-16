import asyncio

import pytest

from chatsky_ui.schemas.process_status import Status


class TestRunProcess:
    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "cmd_to_run, status",
        [
            ("sleep 10000", Status.RUNNING),
            ("false", Status.FAILED),
            ("echo Hello", Status.COMPLETED),
        ],
    )
    async def test_check_status(self, run_process, cmd_to_run, status):
        process = await run_process(cmd_to_run)
        await asyncio.sleep(2)
        assert await process.check_status() == status

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
        process = await run_process("echo Hello")
        output = await process.read_stdout()
        assert output.strip().decode() == "Hello"

    @pytest.mark.asyncio
    async def test_write_stdout(self, run_process):
        process = await run_process("cat")
        await process.write_stdin(b"Chatsky-UI team welcome you.\n")
        output = await process.process.stdout.readline()
        assert output.decode().strip() == "Chatsky-UI team welcome you."


# class TestBuildProcess:
#     pass
