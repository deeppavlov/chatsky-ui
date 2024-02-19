FROM python:3.12

# Configure Poetry
ENV POETRY_VERSION=1.7.1
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VENV=/opt/poetry-venv
ENV POETRY_CACHE_DIR=/opt/.cache

# Install poetry separated from system interpreter
RUN python3 -m venv $POETRY_VENV \
  && $POETRY_VENV/bin/pip install -U pip setuptools \
  && $POETRY_VENV/bin/pip install poetry==${POETRY_VERSION}

# Add `poetry` to PATH
ENV PATH="${PATH}:${POETRY_VENV}/bin"

WORKDIR /app

# Install dependencies
COPY poetry.lock ./
COPY pyproject.toml ./
RUN poetry install

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm
# COPY ./df_designer_front/package.json ./df_designer_front/package-lock.json ./df_designer_front/
# RUN cd df_designer_front && npm install

COPY ./ ./
