#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "No package.json; skipping dev server"
  exit 0
fi

PORT="${SOPBANK_DEV_PORT:-4200}"
SESSION="sopbank_dev"

if tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION" 2>/dev/null; then
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "Sopbank dev server already running on port ${PORT}"
    exit 0
  fi
  tmux -f /exec-daemon/tmux.portal.conf kill-session -t "$SESSION" 2>/dev/null || true
fi

tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION" -c "$PWD" \
  "bash -l -c 'npm start -- --host 0.0.0.0 --port ${PORT} --disable-host-check 2>&1 | tee /tmp/sopbank-dev.log'"

for _ in $(seq 1 120); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "Sopbank dev server ready on http://127.0.0.1:${PORT}/"
    exit 0
  fi
  sleep 1
done

echo "Timed out waiting for dev server; see /tmp/sopbank-dev.log" >&2
tail -30 /tmp/sopbank-dev.log >&2 || true
exit 1
