#!/usr/bin/env bash
# tools/fetch-archives.sh — Download & extract the Chrono Divide game-data archives.
#
# The official client config (client/config.ini) points at these NSIS self-extracting
# installers on archive.org. This script downloads them and extracts the .mix game-data
# files into assets/ra2files/ so you can use Chrono Divide's "Local" mode (folder picker).
#
# Prereqs: curl + 7z (7za/7zz). Both checked below. (AGENTS.md: no global installs;
# this only uses system tools already present.)
#
# Usage: bash tools/fetch-archives.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH_DIR="$ROOT/assets/archives"
FILES_DIR="$ROOT/assets/ra2files"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

# URLs taken verbatim from client/config.ini (gameResArchiveUrl / gameResExpansionArchiveUrl).
RA2_URL="https://archive.org/download/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe"
YR_URL="https://archive.org/download/yuris-revenge-multiplayer/Yuris-Revenge-Multiplayer.exe"
# Optional music (xwis.net) — often unreachable; non-fatal.
MUSIC_URL="https://xwis.net/dl/thememd.mix"

command -v curl >/dev/null || { echo "curl required"; exit 1; }
SZ="$(command -v 7z || command -v 7za || command -v 7zz || true)"
[ -n "$SZ" ] || { echo "7z/7za/7zz required (system package)"; exit 1; }
echo "Using 7z: $SZ"

mkdir -p "$ARCH_DIR" "$FILES_DIR"

dl() { # url out
  echo "Downloading $1"
  curl -L --fail --retry 5 --retry-delay 3 -C - -A "$UA" -H "Accept: */*" "$1" -o "$2"
}

[ -s "$ARCH_DIR/Red-Alert-2-Multiplayer.exe" ] || dl "$RA2_URL" "$ARCH_DIR/Red-Alert-2-Multiplayer.exe"
[ -s "$ARCH_DIR/Yuris-Revenge-Multiplayer.exe" ] || dl "$YR_URL" "$ARCH_DIR/Yuris-Revenge-Multiplayer.exe"
# Optional music
if [ ! -s "$FILES_DIR/thememd.mix" ]; then
  echo "Downloading optional music (xwis.net, may be unreachable)..."
  curl -L --fail --retry 2 -C - -A "$UA" "$MUSIC_URL" -o "$FILES_DIR/thememd.mix" \
    || echo "  (music download failed — non-fatal; game runs without background music)"
fi

echo "Extracting archives -> $FILES_DIR"
"$SZ" x -y -o"$FILES_DIR" "$ARCH_DIR/Red-Alert-2-Multiplayer.exe" >/dev/null
"$SZ" x -y -o"$FILES_DIR" "$ARCH_DIR/Yuris-Revenge-Multiplayer.exe" >/dev/null

# Drop Windows binaries/installer glue that Chrono Divide doesn't use.
cd "$FILES_DIR"
rm -f -- BINKW32.DLL Blowfish.dll Wolapi.dll WOLAPI.WAR xwis.cache xwis.dll XYR.dll \
        game.exe mph.exe mphmd.exe ra2.exe "Red Alert 2.exe" "Yuri's Revenge.exe" NL.CFG \
        maps01.mix movies01.mix movmd03.mix mapsmd03.mix 2>/dev/null || true

echo ""
echo "Game files ready in: $FILES_DIR"
echo "Contents:"
ls -1 -- *.mix 2>/dev/null

echo ""
echo "CRC32 integrity check (client's checkMixesIntegrity expected values):"
check() { printf "  %-16s %s\n" "$1" "$($SZ h "$1" 2>/dev/null | awk '/CRC32  for data/{print $NF}')"; }
check ra2.mix; check multi.mix; check ra2md.mix; check multimd.mix; check expandmd01.mix
echo "  (expected: ra2 5DC70844, multi 3CDB648F, ra2md 49A9E8EA, multimd 743DA541, expandmd01 F3D92D6C)"
