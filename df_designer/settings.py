from pathlib import Path

# server settings
app = "df_designer.main:app"
host = "127.0.0.1"
port = 8000
log_level = "info"
reload = True


# app settings
path_to_save = Path().home().joinpath("data.json")
