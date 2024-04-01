# Use a slim variant to reduce image size where possible
FROM python:3.10-slim as backend-builder

WORKDIR /src

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

COPY ./backend/df_designer /src/backend/df_designer
COPY ./${PROJECT_DIR} /src/${PROJECT_DIR}

# Build the wheel
WORKDIR /src/backend/df_designer
RUN poetry build

#---------------------------------------------------------

FROM oven/bun:1 as frontend-base
FROM frontend-base AS frontend-builder

WORKDIR /src
COPY ./frontend/package.json /src/frontend/package.json
COPY ./frontend/bun.lockb /src/frontend/bun.lockb

RUN cd /src/frontend && bun install --frozen-lockfile

# Copy the rest of the application code
COPY ./frontend/ /src/frontend/
WORKDIR /src/frontend/

RUN bun run build

#---------------------------------------------------------

FROM python:3.10-slim as runtime

ARG PROJECT_DIR

COPY --from=backend-builder /poetry-venv /poetry-venv

# Set environment variable to use the virtualenv
ENV PATH="/poetry-venv/bin:$PATH"

# Copy only the necessary files
COPY --from=backend-builder /src/backend/df_designer /df_designer
COPY --from=backend-builder /src/${PROJECT_DIR} /${PROJECT_DIR}
COPY --from=frontend-builder /src/frontend/dist /backend/static

# Install the wheel
WORKDIR /${PROJECT_DIR}
RUN poetry lock --no-update \
    && poetry install

CMD ["poetry", "run", "dflowd", "run_backend"]


# #TODO: change scr to app (maybe)