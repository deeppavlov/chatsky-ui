#!/bin/sh

export APP_MODULE=${APP_MODULE-chatsky_ui.main:app}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8001}

exec uvicorn --reload --host $HOST --port $PORT "$APP_MODULE"