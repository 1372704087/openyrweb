#!/usr/bin/env bash
# tools/vendor-setup.sh — Populate vendor/ with FOSS libraries extracted from the
# client/ dev baseline (AGENTS.md §4.1: client/ is a read-only, gitignored input
# used only to seed vendor/; it is never distributed or committed).
#
# This is a ONE-TIME setup step (re-run after `rm -rf vendor/dist` or to refresh
# vendored libs). The resulting vendor/ files (FOSS single-file libs, wasm tools,
# fonts, UI icons, locale + html/css templates) are COMMITTED to the repo, so CI
# and end users never need client/ — `npm ci && npm run build:vendor && npm run
# build` works from the committed vendor/ alone.
#
# Run: bash tools/vendor-setup.sh   (after `node tools/fetch-client.mjs`)
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
CLIENT="$ROOT/client"
VENDOR="$ROOT/vendor"

if [ ! -d "$CLIENT" ]; then
  echo "ERROR: client/ baseline missing. Run: node tools/fetch-client.mjs" >&2
  exit 1
fi

echo "Populating vendor/ from client/ baseline (FOSS libs only)..."

# lib/ — FOSS single-file libs (drop poll.js: upstream-only popup widget).
mkdir -p "$VENDOR/lib/three"
cp "$CLIENT/lib/three.min.js" "$VENDOR/lib/"
cp "$CLIENT/lib/three/"*.js "$VENDOR/lib/three/"
for f in system.js lzo1x.js growingpacker.js fullscreen-api-polyfill.min.js; do
  cp "$CLIENT/lib/$f" "$VENDOR/lib/"
done

# dist/ — FOSS wasm tools + polyfills (vendor.bundle.js + worker.js come from build-vendor.mjs).
mkdir -p "$VENDOR/dist"
cp "$CLIENT/dist/7zz.js" "$CLIENT/dist/7zz.wasm" "$VENDOR/dist/"
cp "$CLIENT/dist/ffmpeg.min.js" "$VENDOR/dist/"
cp "$CLIENT/lib/ffmpeg-core.js" "$CLIENT/lib/ffmpeg-core.wasm" "$CLIENT/lib/ffmpeg-core.worker.js" "$VENDOR/dist/"
cp "$CLIENT/dist/web-audio-polyfill.min.js" "$VENDOR/dist/"

# res/fonts — Fira Sans (OFL).
mkdir -p "$VENDOR/res/fonts"
cp "$CLIENT/res/fonts/"* "$VENDOR/res/fonts/"

# res/img — UI icons (drop cd-logo.png).
mkdir -p "$VENDOR/res/img"
for f in "$CLIENT/res/img/"*; do
  [ "$(basename "$f")" = "cd-logo.png" ] && continue
  cp "$f" "$VENDOR/res/img/"
done

# res/locale — locale templates (build localizes en-US/zh-CN/zh-TW).
mkdir -p "$VENDOR/res/locale"
cp "$CLIENT/res/locale/"* "$VENDOR/res/locale/"

# templates/ — index.html + style.css base templates (build rewrites them).
mkdir -p "$VENDOR/templates"
cp "$CLIENT/index.html" "$VENDOR/templates/index.html"
cp "$CLIENT/style.css" "$VENDOR/templates/style.css"

echo "vendor/ populated. Now run: npm run build:vendor && npm run build"
