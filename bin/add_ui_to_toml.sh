#!/bin/bash

# Find the latest version of the wheel file
VERSION=$(basename $(ls ../backend/dist/chatsky_ui-*.whl) | sed -E 's/chatsky_ui-([^-]+)-.*/\1/' | head -n 1)

# Add the specific version to my project
poetry add ../backend/dist/chatsky_ui-$VERSION-py3-none-any.whl
