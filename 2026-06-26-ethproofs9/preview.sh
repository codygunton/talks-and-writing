#!/usr/bin/env bash
# Serve slides locally with theme support (default port 7777)
cd "$(dirname "$0")/.."
PORT="${PORT:-7777}"
# marp-cli binds to 0.0.0.0 but its own log misleadingly prints "localhost".
echo "[preview] serving on http://0.0.0.0:${PORT}/ (marp's localhost log is wrong)"
PORT="$PORT" exec npx @marp-team/marp-cli --theme-set themes/ --html --server 2026-06-26-ethproofs9/
