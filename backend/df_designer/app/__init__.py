import aiofiles
import asyncio

from app.core.logger_config import get_logger

logger = get_logger(__name__)

class Process:
    def __init__(self):
        self.process = None #TODO: is naming ok?
        self.pid = None # process id defined by asyncio.subprocess.Process

    async def start(self, cmd_to_run):
        async with aiofiles.open("process_io.log", "a", encoding="UTF-8") as file: #TODO: log to files
            self.process = await asyncio.create_subprocess_exec(
                *cmd_to_run.split(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
            )
            self.pid = self.process.pid

    def check_status(self):
        if self.process is None:
            return "Process has not been started."
        elif self.process.returncode is None:
            return "Running"
        else:
            return f"Exited with return code: {self.process.returncode}. A non-zero return code indicates an error."

    def stop(self):
        if self.process is None:  # Check if a process has been started
            raise RuntimeError("Cannot stop a process '{self.pid}' that has not started yet.")
        try:
            logger.debug("Terminating process '%s'", self.pid)
            self.process.terminate()
        except ProcessLookupError as exception:
            raise RuntimeError(f"Process '{self.pid}' not found. It may have already exited.") from exception

    def read_stdout(self):
        if self.process is None:
            raise RuntimeError("Cannot read stdout from a process '{self.pid}' that has not started yet.")

        return self.process.stdout.readline()

    def write_stdin(self, message):
        if self.process is None:
            raise RuntimeError("Cannot write into stdin of a process '{self.pid}' that has not started yet.")
        self.process.stdin.write(message)
