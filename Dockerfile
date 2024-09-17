FROM oven/bun:1 as frontend-base
FROM frontend-base AS frontend-builder

WORKDIR /temp
COPY ./frontend/package.json /temp/frontend/package.json
COPY ./frontend/bun.lockb /temp/frontend/bun.lockb

RUN cd /temp/frontend && bun install --frozen-lockfile

# Copy the rest of the application code
COPY ./frontend/ /temp/frontend/
WORKDIR /temp/frontend/

RUN bun run build

#---------------------------------------------------------

FROM python:3.10-slim as backend-builder

WORKDIR /temp

ENV POETRY_VERSION=1.8.2 \
    POETRY_HOME=/poetry \
    POETRY_VENV=/poetry-venv

# Install Poetry in a virtual environment
RUN python3 -m venv $POETRY_VENV \
    && $POETRY_VENV/bin/pip install -U pip setuptools \
    && $POETRY_VENV/bin/pip install poetry==$POETRY_VERSION

ENV PATH="${PATH}:${POETRY_VENV}/bin"

COPY ./backend /temp/backend
COPY --from=frontend-builder /temp/frontend/dist /temp/backend/chatsky_ui/static


# Build the wheel
WORKDIR /temp/backend
RUN poetry build

#---------------------------------------------------------

FROM python:3.10-slim as runtime

ARG PROJECT_DIR

# Install pip and upgrade
RUN pip install --upgrade pip

# Copy only the necessary files
COPY --from=backend-builder /temp/backend/dist /src/dist
COPY ./${PROJECT_DIR} /src/project_dir

# Install the wheel
WORKDIR /src/project_dir
RUN pip install ../dist/*.whl

CMD ["chatsky.ui", "run_app"]
