#!/bin/bash

# Find the latest version of the wheel file
VERSION=$(ls ../backend/dist/chatsky_ui-*.whl | grep -oP 'chatsky_ui-\K[^\-]+' | head -n 1)

# Add the specific version to my project
poetry add ../backend/dist/chatsky_ui-$VERSION-py3-none-any.whl
