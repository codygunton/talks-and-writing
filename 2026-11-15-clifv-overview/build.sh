#!/usr/bin/env bash
# Render overview.md to a standalone overview.html (pandoc; mermaid diagrams via mermaid.js).
set -euo pipefail
cd "$(dirname "$0")"
pandoc overview.md -o overview.html --standalone --toc --toc-depth=2 \
  --lua-filter=mermaid.lua --css=style.css --embed-resources=false \
  --metadata title="clifv: a verified Cranelift backend in Lean" \
  --include-in-header=head.html
echo "wrote $(pwd)/overview.html"
