#!/usr/bin/env bash
# Serve slides locally with theme support (default port 7777)
cd "$(dirname "$0")/.."
PORT="${PORT:-7777}" exec npx @marp-team/marp-cli --theme-set themes/ --html --server 2026-02-13-ethboulder/
