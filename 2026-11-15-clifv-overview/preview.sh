#!/usr/bin/env bash
# Serve the overview locally and rebuild it whenever overview.md changes (default port 7778).
# Open http://localhost:7778/ (or http://<this-host>:7778/ from another machine) and reload after edits.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-7778}"
./build.sh
# The bare URL redirects to the overview.
[[ -e index.html ]] || printf '<meta http-equiv="refresh" content="0; url=overview.html">\n' > index.html
(
  last=$(stat -c %Y overview.md style.css head.html)
  while sleep 1; do
    now=$(stat -c %Y overview.md style.css head.html)
    if [[ "$now" != "$last" ]]; then last=$now; ./build.sh || true; fi
  done
) &
watcher=$!
python3 -m http.server "$PORT" --bind 0.0.0.0 >/dev/null 2>&1 &
server=$!
trap 'kill "$watcher" "$server" 2>/dev/null' EXIT INT TERM
echo "[preview] serving on http://0.0.0.0:${PORT}/ (rebuilds on change; reload the page)"
wait "$server"
