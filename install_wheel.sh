#!/bin/bash
# Install poetry
curl -sSL https://install.python-poetry.org | python3 -

# Add poetry to PATH
export PATH="$HOME/.local/bin:$PATH"

# Build the project to create the dist directory and .whl file
poetry build

# Find the first .whl file in the dist directory and install it
WHEEL_FILE=$(ls dist/*.whl | head -n 1)
if [ -z "$WHEEL_FILE" ]; then
    echo "No .whl file found in the dist directory."
    exit 1
fi
pip install "$WHEEL_FILE"

chatsky.ui init --no-input
