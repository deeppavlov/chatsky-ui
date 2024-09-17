## Introduction
We have almost finished the main functionality. Nevertheless, we will be glad to receive your pull requests and issues for adding new features if you are missing something. We know that we have weaknesses in the documentation and basic examples.
We will be glad if you contribute to Dialog Flow Designer. 

## Rules for submitting a PR
All PRs are reviewed by Chatsky-UI developers team. In order to make the reviewer job easier and increase the chance that your PR will be accepted, please add a short description with information about why this PR is needed and what changes will be made. 

## Development
We use poetry as a handy dependency management and packaging tool, which reads pyproject.toml to get specification for commands. poetry is a tool for command running automatization. If your environment does not support poetry, it can be installed as a python package with `pipx install poetry`. However, It's recommended to install isolated from the global Python environment, which prevents potential conflicts with other packages ([Installation on the official site](https://python-poetry.org/docs/#installing-with-the-official-installer:~:text=its%20own%20environment.-,Install%20Poetry,-The%20installer%20script)).


### Prepare the Enviroment

```bash
python3 -m venv poetry-venv \ # create virtual env and install poetry
    && poetry-venv/bin/pip install poetry==1.8.2
cd backend \ # using poetry, install Chatsky-UI package
    && poetry install \
    && poetry shell \
    && cd ../../
```

### Documentation
Build the documentation:
```bash
make build_doc
```
`docs/_build` dir will be created and you can open the index file `./docs/_build/html/index.html` with your browser.

### Test
To run unit, integration, and end-to-end tests:
```bash
make backend_tests
```