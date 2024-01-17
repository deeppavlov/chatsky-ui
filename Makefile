.ONESHELL:

SHELL = /bin/bash

PYTHON = python3
FRONTEND_PATH = ./df_designer_front

.PHONY: help
help:
	@echo "help ..."





# frontend cmds
.PHONY: env_frontend
env_frontend:
	cd ${FRONTEND_PATH} && npm install

.PHONY: clean_env_frontend
clean_env_frontend:
	cd ${FRONTEND_PATH} && rm -rf 

.PHONY: build_frontend
build_frontend: env_frontend
	cd ${FRONTEND_PATH} && npm run build

.PHONY: run_frontend
run_frontend: env_frontend
	cd ${FRONTEND_PATH} && npm start

.PHONY: dev_frontend
dev_frontend: env_frontend
	make run_frontend




# backend cmds
.PHONY: env_backend
env_backend:
	poetry install

.PHONY: clean_env_backend
clean_env_backend:
	poetry env remove --all

.PHONY: run_backend
run_backend:
	poetry run python -m df_designer run-app --cmd-to-run="ping ya.ru"

.PHONY: run_dev_backend
run_dev_backend:
	poetry shell
	# TODO ...




# general cmds
.PHONY: env
env:
	make env_frontend
	make env_backend

.PHONY: run_app
run_app:
	make build_frontend
	make run_backend

.PHONY: run_dev
run_dev:
	make build_frontend
	make run_dev_backend

.PHONY: build
build:
	make build_frontend
	# TODO build wheel

.PHONY: clean
clean:
	make clean_env_frontend
	make clean_env_backend




# Все команды ниже нужно дописать для фронта и бэка
.PHONY: format
format:
	# black --line-length=120 --exclude='venv|build|tutorials' .
	# black --line-length=80 tutorials

.PHONY: lint
lint:
	# flake8 --max-line-length=120 --exclude venv,build,tutorials --per-file-ignores='**/__init__.py:F401' .
	# flake8 --max-line-length=100 --per-file-ignores='**/3_load_testing_with_locust.py:E402 **/4_streamlit_chat.py:E402'  tutorials
	# @set -e && black --line-length=120 --check --exclude='venv|build|tutorials' . && black --line-length=80 --check tutorials || ( \
		# echo "================================"; \
		# echo "Bad formatting? Run: make format"; \
		# echo "================================"; \
		# false)
	TODO: Add mypy testing
	@mypy . --exclude venv*,build


.PHONY: test
test:
	# source <(cat .env_file | sed 's/=/=/' | sed 's/^/export /') && pytest -m "not no_coverage" --cov-fail-under=$(TEST_COVERAGE_THRESHOLD) --cov-report html --cov-report term --cov=dff --allow-skip=$(TEST_ALLOW_SKIP) tests/
