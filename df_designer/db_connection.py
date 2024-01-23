from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from df_designer.settings import app


class Base(DeclarativeBase):
    pass


class Runs(Base):
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    datetime: Mapped[str]
    path: Mapped[str]
    status: Mapped[str]


async_engine = create_async_engine(f"sqlite+aiosqlite:///{app.database_file}")
async_session = async_sessionmaker(async_engine, expire_on_commit=False)
