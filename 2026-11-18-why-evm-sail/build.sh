#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx --no-install marp 2026-11-18-why-evm-sail/slides.md --html -o 2026-11-18-why-evm-sail/index.html
