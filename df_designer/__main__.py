import uvicorn
from df_designer import settings


def main():
    """Run the application."""
    config = uvicorn.Config(
        app=settings.app,
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=settings.reload,
    )
    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    main()
