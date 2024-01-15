import dff
import typer
import uvicorn

from df_designer.settings import app

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
):
    """Run the application."""
    app.dir_logs = dir_logs
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
