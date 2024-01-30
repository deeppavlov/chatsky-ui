import asyncio
import aiofiles

from df_designer.db_requests import run_insert, run_update
from df_designer.logic import create_directory_to_log, log_file_name
from df_designer.settings import app


class Proc:
    async def start(self):
        """Start the process."""
        create_directory_to_log()
        file_for_log = log_file_name()
        self.id_record = await run_insert(file_for_log, "start")
        async with aiofiles.open(file_for_log, "w", encoding="UTF-8") as file:
            self.process = await asyncio.create_subprocess_exec(
                # "ping",
                # "localhost",
                # "python",
                # "correct_script.py",
                # "error_script.py",
                *app.cmd_to_run.split(" "),
                stdout=file.fileno(),
                stderr=file.fileno(),
            )
            return self.process.pid

    async def check_status(self):
        """Check status process and write fo database."""
        while True:
            await asyncio.sleep(1)
            if self.process.returncode is not None:
                if self.process.returncode == 0:
                    await run_update(self.id_record, "stop")
                    break
                elif self.process.returncode > 0:
                    await run_update(self.id_record, "error")
                    break

    async def stop(self):
        """Stop the process."""
        self.process.terminate()
        await run_update(self.id_record, "terminate")

    async def status(self):
        """Return the status of the process."""
        return self.process.returncode

    async def pid(self):
        return self.process.pid


process = Proc()
