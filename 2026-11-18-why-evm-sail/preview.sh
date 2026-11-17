#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-7778}" exec npx --no-install marp --html --server 2026-11-18-why-evm-sail/
