#!/usr/bin/env node
/**
 * tools/mix-tool.mjs — Minimal Westwood MIX archive inspector.
 *
 * Implements the MIX format as the engine itself reads it (data/MixFile.ts.js +
 * data/MixEntry.ts.js + data/Crc32.ts.js). Supports:
 *   - unencrypted TD/RA2 format (flag bits 0)  ← ra2cd.mix uses this
 *   - listing entries (offset/length/hash) and dumping a file by name
 *
 * Filename resolution: MIX stores only a CRC32-based hash, not names. We can REVERSE
 * a hash to a name only if we know candidate names. So `list` shows hashes + sizes;
 * `find <name>` hashes the given name and reports whether it's present; `extract <name>`
 * pulls it out by hashing the name.
 *
 * Usage:
 *   node tools/mix-tool.mjs list <file.mix>
 *   node tools/mix-tool.mjs find  <file.mix> <name>
 *   node tools/mix-tool.mjs extract <file.mix> <name> <outFile>
 */

import { readFileSync, writeFileSync, openSync, readSync, closeSync, statSync } from "node:fs";

// --- CRC32 (table copied verbatim from src-reconstructed/data/Crc32.ts.js) ----------
const CRC_TABLE = (() => {
  // standard zlib/RA2 CRC32 (poly 0xEDB88320, reflected). Matches engine's table.
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes, start = 0xffffffff) {
  let c = start;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ start) >>> 0;
}

// --- Westwood filename hash (verbatim from data/MixEntry.ts.js::hashFilename) -------
function wwHashFilename(name) {
  let s = name.toUpperCase();
  const l = s.length;
  const r = l >> 2;
  if (l & 3) {
    s += String.fromCharCode(l - (r << 2));
    let e = 3 - (l & 3);
    while (e-- > 0) s += s[r << 2];
  }
  return crc32(Buffer.from(s, "binary"));
}

// --- binaryStringToUint8Array (matches util/string binaryStringToUint8Array) --------
// Treats each char code as a byte 0..255.

// --- MIX parsing -------------------------------------------------------------------
const FLAG_CHECKSUM = 0x00010000;
const FLAG_ENCRYPTED = 0x00020000;

function parseMix(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let pos = 0;
  const flags = dv.getUint32(pos, true);
  pos += 4;
  let isEncrypted = (flags & FLAG_ENCRYPTED) !== 0 && (flags & ~(FLAG_CHECKSUM | FLAG_ENCRYPTED)) === 0;
  let bodyOffset;
  let count;
  const entries = [];

  if ((flags & ~(FLAG_CHECKSUM | FLAG_ENCRYPTED)) !== 0) {
    // Not flags — it's the count (TS/RA2 new-format without flags). Re-seek.
    // Actually per MixFile.parseHeader: if (t) where t = flags==0 of mask. If not t (has high bits
    // meaning real count), seek(0) and parseTdHeader. So treat first uint32 as count.
    pos = 0;
    count = dv.getUint32(pos, true);
    pos += 4;
    pos += 4; // bodySize (skip)
    bodyOffset = parseIndex(dv, pos, count, entries);
  } else {
    // flags present
    if (isEncrypted) {
      throw new Error("Encrypted MIX not supported by this tool (ra2cd.mix is unencrypted).");
    }
    count = dv.getUint16(pos, true);
    pos += 2;
    pos += 4; // bodySize
    bodyOffset = parseIndex(dv, pos, count, entries);
  }
  return { flags, count, bodyOffset, entries };
}

function parseIndex(dv, pos, count, entries) {
  for (let i = 0; i < count; i++) {
    const hash = dv.getUint32(pos, true);
    pos += 4;
    const offset = dv.getUint32(pos, true);
    pos += 4;
    const length = dv.getUint32(pos, true);
    pos += 4;
    entries.push({ hash: hash >>> 0, offset, length });
  }
  return pos;
}

function cmdList(file) {
  const buf = readFileSync(file);
  const { flags, count, bodyOffset, entries } = parseMix(buf);
  console.log("MIX: " + file);
  console.log("  flags: 0x" + flags.toString(16) + "  count: " + count + "  bodyOffset: " + bodyOffset + "  totalSize: " + buf.length);
  console.log("  idx   hash       offset     length");
  entries.forEach((e, i) => {
    console.log(
      "  " + String(i).padStart(4) +
      "  0x" + e.hash.toString(16).padStart(8, "0") +
      " " + String(e.offset).padStart(10) +
      " " + String(e.length).padStart(10)
    );
  });
}

function cmdFind(file, name) {
  const buf = readFileSync(file);
  const { entries, bodyOffset } = parseMix(buf);
  const want = wwHashFilename(name);
  const hit = entries.find((e) => e.hash === want);
  if (hit) {
    console.log(`FOUND  '${name}'  hash=0x${want.toString(16)}  offset=${hit.offset} length=${hit.length} (bodyOffset=${bodyOffset})`);
  } else {
    console.log(`NOT FOUND  '${name}'  hash=0x${want.toString(16)}`);
  }
}

function cmdExtract(file, name, outFile) {
  const buf = readFileSync(file);
  const { entries, bodyOffset } = parseMix(buf);
  const want = wwHashFilename(name);
  const hit = entries.find((e) => e.hash === want);
  if (!hit) {
    console.error(`NOT FOUND: '${name}' (hash 0x${want.toString(16)})`);
    process.exit(2);
  }
  const start = bodyOffset + hit.offset;
  const data = buf.subarray(start, start + hit.length);
  writeFileSync(outFile, data);
  console.log(`extracted '${name}' -> ${outFile}  (${hit.length} bytes)`);
}

// --- repack: rebuild a MIX from an original MIX, optionally excluding named files. ----
// Format written matches what MixFile.ts.js reads (TD/RA2 unencrypted form with flags).
//   header: flags(u32, =0x10000 checksum) | count(u16) | bodySize(u32)
//   index : count × { hash(u32) | offset(u32) | length(u32) }
//   body  : concatenated file bytes (each entry's offset relative to body start)
function cmdRepack(inFile, outFile, excludeNamesCsv) {
  const exclude = (excludeNamesCsv || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const buf = readFileSync(inFile);
  const { flags, entries, bodyOffset } = parseMix(buf);

  // Resolve each entry's name (we only know excluded ones by name; everything else is
  // kept by hash). Filter out excluded entries by hashing each candidate.
  const keep = entries.filter((e) => {
    // Is this entry's hash one of the excluded names?
    return !exclude.some((nm) => wwHashFilename(nm) === e.hash);
  });
  const dropped = entries.length - keep.length;

  // Build the body: concatenate kept entries' data, tracking new offsets.
  const bodyChunks = [];
  let bodySize = 0;
  const newIndex = [];
  for (const e of keep) {
    const start = bodyOffset + e.offset;
    const data = buf.subarray(start, start + e.length);
    newIndex.push({ hash: e.hash, offset: bodySize, length: e.length });
    bodyChunks.push(Buffer.from(data));
    bodySize += e.length;
  }
  const body = Buffer.concat(bodyChunks);

  // Assemble header + index + body.
  const FLAG_CHECKSUM = 0x00010000;
  const headerSize = 4 + 2 + 4; // flags + count + bodySize
  const indexSize = newIndex.length * 12;
  const out = Buffer.alloc(headerSize + indexSize + body.length);
  let p = 0;
  out.writeUInt32LE(FLAG_CHECKSUM, p); p += 4;       // flags (checksum, not encrypted)
  out.writeUInt16LE(newIndex.length, p); p += 2;      // count
  out.writeUInt32LE(body.length, p); p += 4;          // bodySize
  for (const e of newIndex) {
    out.writeUInt32LE(e.hash >>> 0, p); p += 4;
    out.writeUInt32LE(e.offset, p); p += 4;
    out.writeUInt32LE(e.length, p); p += 4;
  }
  body.copy(out, p);

  writeFileSync(outFile, out);
  console.log(`repacked ${inFile} -> ${outFile}`);
  console.log(`  entries: ${entries.length} -> ${newIndex.length} (dropped ${dropped})`);
  console.log(`  size: ${buf.length} -> ${out.length} bytes`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "list") cmdList(rest[0]);
else if (cmd === "find") cmdFind(rest[0], rest[1]);
else if (cmd === "extract") cmdExtract(rest[0], rest[1], rest[2]);
else if (cmd === "repack") cmdRepack(rest[0], rest[1], rest[2]);
else {
  console.log("Usage:");
  console.log("  mix-tool.mjs list <file.mix>");
  console.log("  mix-tool.mjs find <file.mix> <name>");
  console.log("  mix-tool.mjs extract <file.mix> <name> <outFile>");
  console.log("  mix-tool.mjs repack <in.mix> <out.mix> [exclude=name1,name2]");
  process.exit(1);
}
