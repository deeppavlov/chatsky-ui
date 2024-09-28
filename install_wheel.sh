#!/bin/bash
# Find the first .whl file in the dist directory and install it
WHEEL_FILE=$(ls dist/*.whl | head -n 1)
if [ -z "$WHEEL_FILE" ]; then
    echo "No .whl file found in the dist directory."
    exit 1
fi
pip install "$WHEEL_FILE"