#!/usr/bin/env bash
# Idempotent: ensure playwright is installed (cwd-local) + run the Stage A boot test.
# Designed to survive the env's intermittent FS overlay resets by doing setup+run in one shot.
set -e
cd "$(dirname "$0")/.."
LOG=/tmp/headless-boot-run.log
exec > "$LOG" 2>&1
echo "[run] $(date)"
if [ ! -d node_modules/playwright ]; then
  echo "[run] playwright missing — reinstalling"
  npm install -D playwright@1.61.1 >/dev/null 2>&1 || { echo "[run] npm install failed"; exit 1; }
fi
echo "[run] playwright present: $(ls node_modules/playwright/package.json 2>/dev/null || echo NO)"
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.browsers"
echo "[run] launching boot-menu (headless)"
node tests/headless/boot-menu.cjs
echo "[run] exit=$?"
