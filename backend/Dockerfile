# Use a slim variant to reduce image size where possible
FROM python:3.10-slim as builder

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

COPY ./df_designer /src/df_designer
COPY ./${PROJECT_DIR} /src/${PROJECT_DIR}

# Build the wheel
WORKDIR /src/df_designer
RUN poetry build


FROM python:3.10-slim as runtime

ARG PROJECT_DIR

COPY --from=builder /poetry-venv /poetry-venv

# Set environment variable to use the virtualenv
ENV PATH="/poetry-venv/bin:$PATH"

# Copy only the necessary files
COPY --from=builder /src/df_designer /df_designer
COPY --from=builder /src/${PROJECT_DIR} /${PROJECT_DIR}

# Install the wheel
WORKDIR /${PROJECT_DIR}
RUN poetry lock --no-update \
    && poetry install

CMD ["poetry", "run", "dflowd", "run_app"]
