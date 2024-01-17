import dff
import typer
import uvicorn

from df_designer.settings import app
from sqlalchemy import create_engine
from df_designer.db_connection import Base

cli = typer.Typer()


@cli.command()
def build():
    print("in developing ...")


@cli.command()
def meta():
    print(f"dff version: {dff.__version__}")


@cli.command()
def run_app(
    ip_address: str = app.conf_host,
    port: int = app.conf_port,
    dir_logs: str = app.dir_logs,
    cmd_to_run: str = app.cmd_to_run,
):
    """Run the application."""
    app.cmd_to_run = cmd_to_run
    app.dir_logs = dir_logs
    engine = create_engine(f"sqlite:///{app.database_file}")
    Base.metadata.create_all(engine)
    config = uvicorn.Config(
        app=app.conf_app,
        host=ip_address,
        port=port,
        log_level=app.conf_log_level,
        reload=app.conf_reload,
    )
    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    cli()
