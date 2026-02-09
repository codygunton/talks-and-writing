#!/usr/bin/env bash
# Serve slides on port 8000 with live reload (access via SSH port-forward)
cd "$(dirname "$0")"
PORT=8000 exec npx @marp-team/marp-cli -s . --allow-local-files --html
