#!/usr/bin/env bash
# tools/extract-yr-exe.sh — Extract the YR engine executable from the NSIS
# installer into a dedicated reverse-engineering directory.
#
# The installer `assets/archives/Yuris-Revenge-Multiplayer.exe` (CnCNet/XWIS
# multiplayer repack) ships the YR engine under the name "Yuri's Revenge.exe"
# (renamed from the disc's `gamemd.exe`). It is the LAST file in a single
# solid-LZMA NSIS block, so `7z l` shows a BLANK size column for it (a known
# 7z/NSIS listing artifact — NOT a 0-byte file). This script extracts just
# that one entry and verifies it is a real PE32 (~4.5–4.9 MiB).
#
# Writes only inside the project cwd (AGENTS.md §1). The 200 MiB .mix payloads
# are NEVER extracted to disk; if name-based extraction fails we fall back to a
# RAM-backed /dev/shm scratch dir that is wiped immediately.
#
# Output:  re/yr-exe/Yuri's Revenge.exe   (gitignored, EA-copyrighted)
#          re/yr-exe/verify.txt           (audit trail)
#
# Usage:   bash tools/extract-yr-exe.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="$ROOT/assets/archives/Yuris-Revenge-Multiplayer.exe"
OUT="$ROOT/re/yr-exe"
EXE="$OUT/Yuri's Revenge.exe"
VERIFY="$OUT/verify.txt"

SZ="$(command -v 7z || command -v 7za || command -v 7zz || true)"
[ -n "$SZ" ] || { echo "7z/7za/7zz required (system package)"; exit 1; }

[ -f "$ARCH" ] || { echo "Installer not found: $ARCH"; echo "Run tools/fetch-archives.sh first."; exit 1; }

mkdir -p "$OUT"
: > "$VERIFY"

echo "Installer: $ARCH"                                | tee -a "$VERIFY"
echo "7z:        $SZ ($("$SZ" 2>&1 | head -1))"        | tee -a "$VERIFY"
echo ""                                                | tee -a "$VERIFY"

# --- primary path: name-based single-file extraction ----------------------------
echo "[1/2] name-based extract: \"Yuri's Revenge.exe\" -> $OUT" | tee -a "$VERIFY"
# -y assume-yes, -bso0/-bse0/-bsp0 silence noise. NSIS preserves the literal
# filename (apostrophe + space); quote it.
"$SZ" e "$ARCH" "Yuri's Revenge.exe" -o"$OUT" -y -bso0 -bse0 -bsp0 2>>"$VERIFY" || true

ok=0
if [ -f "$EXE" ]; then
  sz=$(stat -c %s "$EXE" 2>/dev/null || echo 0)
  if [ "$sz" -gt 1000000 ] && file "$EXE" | grep -qi 'PE32'; then
    ok=1
  fi
fi

# --- fallback: full extract to RAM tmpfs, copy only the exe out -----------------
if [ "$ok" -ne 1 ]; then
  echo ""                                                                | tee -a "$VERIFY"
  echo "[1/2] name-based extract did not yield a >1MB PE32 — falling back to /dev/shm full extract" | tee -a "$VERIFY"
  SCRATCH="/dev/shm/yr-extract-$$"
  mkdir -p "$SCRATCH"
  trap 'rm -rf --one-file-system "$SCRATCH" 2>/dev/null || true' EXIT
  # Full decompress (~330 MiB) into RAM tmpfs (ephemeral, gone on reboot).
  "$SZ" x "$ARCH" -o"$SCRATCH" -y -bso0 -bse0 -bsp0 2>>"$VERIFY" || true
  if [ -f "$SCRATCH/Yuri's Revenge.exe" ]; then
    cp -p -- "$SCRATCH/Yuri's Revenge.exe" "$EXE"
  fi
  rm -rf --one-file-system "$SCRATCH" 2>/dev/null || true
  trap - EXIT
fi

# --- verification ----------------------------------------------------------------
echo ""                                                                | tee -a "$VERIFY"
echo "[2/2] verification"                                              | tee -a "$VERIFY"
if [ ! -f "$EXE" ]; then
  echo "FAIL: $EXE not produced"                                       | tee -a "$VERIFY"
  exit 2
fi
sz=$(stat -c %s "$EXE")
echo "  size:     $sz bytes"                                           | tee -a "$VERIFY"
echo "  file:     $(file "$EXE")"                                      | tee -a "$VERIFY"
echo "  objdump:  $(objdump -f "$EXE" 2>&1 | head -3 | tr '\n' '|')"   | tee -a "$VERIFY"
echo "  sha256:   $(sha256sum "$EXE" | cut -d' ' -f1)"                 | tee -a "$VERIFY"

if echo "$sz" | grep -qE '^[0-9]+$' && [ "$sz" -gt 1000000 ] && file "$EXE" | grep -qi 'PE32'; then
  echo ""                                                              | tee -a "$VERIFY"
  echo "OK: extracted real PE32 ($sz bytes) -> $EXE"                   | tee -a "$VERIFY"
  exit 0
fi
echo "FAIL: not a >1MB PE32 (size=$sz)"                                | tee -a "$VERIFY"
exit 3
