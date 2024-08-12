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

# Use a slim variant to reduce image size where possible
FROM python:3.10-slim as backend-builder

WORKDIR /temp

ARG PROJECT_DIR
# ENV PROJECT_DIR ${PROJECT_DIR}

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

COPY ./${PROJECT_DIR} /temp/${PROJECT_DIR}

# Build the wheel
WORKDIR /temp/backend
RUN poetry build

#---------------------------------------------------------

#TODO: create something like src named e.g. runtime/

FROM python:3.10-slim as runtime

ARG PROJECT_DIR

COPY --from=backend-builder /poetry-venv /poetry-venv

# Set environment variable to use the virtualenv
ENV PATH="/poetry-venv/bin:$PATH"

# Copy only the necessary files
COPY --from=backend-builder /temp/backend /src2/backend
COPY ./${PROJECT_DIR} /src2/project_dir

# Install the wheel
WORKDIR /src2/project_dir
RUN poetry lock --no-update \
    && poetry install

CMD ["poetry", "run", "chatsky.ui", "run_app"]


# #TODO: change scr to app (maybe)