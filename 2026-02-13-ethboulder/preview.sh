#!/usr/bin/env bash
# Serve slides on port 8000 (manual refresh needed after edits)
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "Error: node_modules not found. Run 'npm install' first." >&2
  exit 1
fi
PORT=8000 exec npx @marp-team/marp-cli -s . --allow-local-files --html
