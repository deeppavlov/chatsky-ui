from typing import Any
from df_designer.db_connection import Logs, async_session
from sqlalchemy import insert, select, update
import time
from pathlib import Path


async def run_insert(file_for_log: Path, process_status: str):
    """Insert process data."""
    async with async_session() as session:
        stmt = (
            insert(Logs)
            .values(
                datetime=time.time(),
                path=str(Path(file_for_log).absolute()),
                status=process_status,
            )
            .returning()
        )
        id_record = await session.execute(stmt)
        await session.commit()
        return id_record


async def run_update(id_record: Any, process_status: str):
    """Update process data."""
    async with async_session() as session:
        stmt = (
            update(Logs)
            .values(status=process_status)
            .where(Logs.id == id_record.inserted_primary_key[0])
        )
        await session.execute(stmt)
        await session.commit()


async def run_last():
    """Return last run path."""
    async with async_session() as session:
        # stmt = select(Runs.path).where(Runs.status == "start").order_by(Runs.datetime)
        stmt = (
            select(Logs.path)
            .order_by(Logs.datetime.desc())
            .where(Logs.status == "start")
        )
        result = await session.execute(stmt)
        return result.scalar()
