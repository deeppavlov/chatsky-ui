import asyncio

import aiofiles

from df_designer.logic import create_directory_to_log, log_file_name


class Proc:
    def __init__(self):
        self.run = False

    async def start(self):
        # create_directory_to_log()
        if not self.run:
            async with aiofiles.open("/tmp/logs.txt", "w") as file:
                self.process = await asyncio.create_subprocess_exec(
                    "ping",
                    "localhost",
                    # shell=True,
                    stdout=file,
                    stderr=file,
                )
                self.run = True
                return self.process.pid
        return self.process.pid

    async def stop(self):
        if self.run:
            self.process.terminate()
            self.run = False
            del self.process

    async def status(self):
        if self.run:
            status_proc = self.process.returncode
            if status_proc is None:
                return True
            else:
                return status_proc
        else:
            return False

    async def pid(self):
        if self.run:
            return self.process.pid


process = Proc()
