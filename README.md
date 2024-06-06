# Quick Start
## System Requirements
Ensure you have Python version 3.10 or higher installed.

## Installation
To install the necessary package, run the following command:
```bash
pip install dflowd==0.1.0b0
```

## Project Initiation
Initialize your project by running:
```bash
dflowd init
cd <PROJECT-SLUG> # enter the slug you choose for your project with the help of the previous command
```
The `dflowd init` command will start an interactive `cookiecutter` process to create a project based on a predefined template. The resulting project will be a simple example template that you can customize to suit your needs.

## Running Your Project
To run your project, use the following command:
```bash
dflowd run_backend
```
Note: Currently, the project runs exclusively on port 8000.
