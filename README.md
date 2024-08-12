# Quick Start
## System Requirements
Ensure you have Python version 3.10 or higher installed.

## Installation
To install the necessary package, run the following command:
```bash
pip install chatsky-ui --pre
```

## Configuring the chatsky-ui app
You may add a `.env` file in the root directory and configure any of following environment variables. The values shown below are the default ones.
```.env
HOST=0.0.0.0
PORT=8000
CONF_RELOAD=True
LOG_LEVEL=info

GRACEFUL_TERMINATION_TIMEOUT=2  # Waiting for process to stop
PING_PONG_TIMEOUT=0.5  # Waiting the process to response before it mark it as still `running`

# For tests:
BUILD_COMPLETION_TIMEOUT=10
RUN_RUNNING_TIMEOUT=5
```

## Project Initiation
Initialize your project by running:
```bash
chatsky.ui init
cd <PROJECT-SLUG> # enter the slug you choose for your project with the help of the previous command
```
The `chatsky.ui init` command will start an interactive `cookiecutter` process to create a project based on a predefined template. The resulting project will be a simple example template that you can customize to suit your needs.

## Running Your Project
To run your project, use the following command:
```bash
chatsky.ui run_app
```
