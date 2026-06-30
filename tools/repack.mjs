#!/usr/bin/env node
/**
 * tools/repack.mjs — Repack src/ (reconstructed SystemJS modules) into a single bundle.
 *
 * Purpose: produce build/dist/ra2web.js — a working SystemJS-register bundle built
 * FROM OUR reconstructed source, replacing the original precompiled ra2web.min.js.
 * This is the linchpin of the open-source / zero-CD-trace plan: the client bundle is
 * our product, rebuilt from src/.
 *
 * Bundle format (must match what lib/system.js + index.html expect):
 *     <prelude: TS runtime helpers>
 *     System.register("name",["deps"],function(e,t){...});   // ×1218
 *
 * Aliases applied at repack time (normalize internal SystemJS aliases):
 *   - "@chronodivide/sp-bots"      -> "@openyrweb/sp-bots"   (in GameLoader import)
 *   - version module string        -> OpenYRWeb version      (default 0.1.0)
 *
 * Minification: we collapse each module body back to one line (safe — SystemJS register
 * format is whitespace-insensitive; ASI is preserved because statements stay ;-terminated).
 * We do NOT re-mangle identifiers.
 *
 * Usage:
 *   node tools/repack.mjs                # src/ -> build/dist/ra2web.js
 *   VERSION=0.2.0 node tools/repack.mjs  # override version
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "src");
const OUT_FILE = join(ROOT, "build", "dist", "ra2web.js");
const MAP = join(SRC, "_module-map.json");
const VERSION = process.env.VERSION || "0.1.0";

// Alias-normalization substitutions applied to every module's source text.
const ALIASES = [
  [/@chronodivide\/sp-bots/g, "@openyrweb/sp-bots"],
  [/@chronodivide\/game-api/g, "@openyrweb/game-api"],
  // Internal cache-bust query strings (worker / asset URLs) — normalize versions.
  [/\?v=0\.82\.0(-\d+)?/g, "?v=" + VERSION],
];

/** Extract the System.register(...) body from a reconstructed module file, minus our
 *  header comments, and collapse to a single line. Throws if it doesn't look right. */
function extractModule(filePath, name) {
  let src = readFileSync(filePath, "utf8");
  // Strip our leading // === header comment lines (everything before the System.register).
  const regIdx = src.indexOf("System.register");
  if (regIdx < 0) throw new Error(`No System.register in ${filePath}`);
  let body = src.slice(regIdx).trimEnd();

  // The module should end with ");" — but our files have a trailing newline. Ensure we
  // capture exactly one complete System.register(...) statement. The file contains only
  // that statement, so taking from regIdx to end (trimmed) is correct.
  if (!body.endsWith(");")) {
    // tolerate a missing semicolon
    body = body.replace(/\s*$/, "") + ";";
  }

  // Apply alias-normalization substitutions.
  for (const [re, repl] of ALIASES) body = body.replace(re, repl);

  // Override the version module's exported version string.
  if (name === "version") {
    // match:  e("version","0.82.0")  (single or double quotes)
    body = body.replace(/(\(?"version"\s*,\s*)"[^"]*"/, '$1"' + VERSION + '"');
  }

  // Collapse whitespace runs to single spaces, but NOT inside strings/regexps.
  // Simplest safe approach: tokenize-free collapse that preserves string contents.
  return collapseWhitespace(body) + "\n";
}

/** Collapse runs of whitespace to a single space, preserving string/template/regex/
 *  comment contents (so e.g. /^\// and "a\nb" survive intact). Uses a full JS lexer
 *  that knows when a `/` starts a regex vs division. */
function collapseWhitespace(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  // Track the previous significant (non-whitespace, non-comment) emitted char so we can
  // decide whether a `/` is a regex literal (after operators, keywords, `(`, `,`, etc.)
  // or a division (after identifiers, numbers, `)`, `]`).
  let prevSig = "("; // start of file acts like a regex-allowed context
  const regexAllowedAfter = (ch) =>
    !/[0-9A-Za-z_$)\].]/.test(ch) && ch !== '"';

  while (i < n) {
    const c = code[i];
    const c2 = code[i + 1];

    // --- line comment ---
    if (c === "/" && c2 === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    // --- block comment -> single space ---
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      if (out.length && out[out.length - 1] !== " ") out += " ";
      continue;
    }
    // --- whitespace ---
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      if (out.length && out[out.length - 1] !== " ") out += " ";
      i++;
      continue;
    }
    // --- string literals: copy verbatim (preserve inner whitespace/newlines) ---
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      prevSig = c;
      i++;
      while (i < n) {
        const cc = code[i];
        out += cc;
        if (cc === "\\") {
          out += code[i + 1] || "";
          i += 2;
          continue;
        }
        if (cc === quote) {
          i++;
          break;
        }
        // template `${...}` nesting: keep as-is (verbatim copy handles it).
        i++;
      }
      continue;
    }
    // --- regex literal: copy verbatim (preserve inner content) ---
    if (c === "/" && regexAllowedAfter(prevSig)) {
      out += c;
      prevSig = c;
      i++;
      let inClass = false;
      while (i < n) {
        const cc = code[i];
        out += cc;
        if (cc === "\\") {
          out += code[i + 1] || "";
          i += 2;
          continue;
        }
        if (cc === "[") inClass = true;
        else if (cc === "]") inClass = false;
        else if (cc === "/" && !inClass) {
          i++;
          // consume flags
          while (i < n && /[a-z]/i.test(code[i])) {
            out += code[i];
            i++;
          }
          break;
        }
        i++;
      }
      // prevSig becomes the trailing flag char or '/'
      prevSig = out[out.length - 1];
      continue;
    }
    // --- ordinary char ---
    out += c;
    prevSig = c;
    i++;
  }
  return out.trim();
}

function main() {
  if (!existsSync(MAP)) {
    console.error("Missing src/_module-map.json. Run tools/split-bundle.mjs first.");
    process.exit(1);
  }
  const map = JSON.parse(readFileSync(MAP, "utf8"));
  console.log("Repacking " + map.moduleCount + " modules from src/ -> " + OUT_FILE);

  const parts = [];
  // Prelude first.
  let prelude = readFileSync(join(SRC, "_runtime", "prelude.ts.js"), "utf8");
  // strip the header comment from prelude
  prelude = prelude.replace(/^\/\/[^\n]*\n/gm, "").trim();
  parts.push(collapseWhitespace(prelude));

  let count = 0;
  let versionChanged = false;
  for (const mod of map.modules) {
    const filePath = join(SRC, mod.file);
    if (!existsSync(filePath)) {
      console.warn("  SKIP missing: " + mod.file);
      continue;
    }
    const wasVersion = mod.name === "version";
    const body = extractModule(filePath, mod.name);
    if (wasVersion && body.includes('"' + VERSION + '"')) versionChanged = true;
    parts.push(body);
    count++;
    if (count % 200 === 0) process.stdout.write("\r  repacked " + count + "/" + map.moduleCount);
  }

  const bundle = parts.join("\n");
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, bundle);

  console.log("\n  repacked " + count + " modules");
  console.log("  version module set to " + VERSION + ": " + versionChanged);
  console.log("  bundle size: " + (bundle.length / 1024 / 1024).toFixed(2) + " MB");
  console.log("  written: " + OUT_FILE);

  // Sanity: ensure no upstream-alias strings leaked into the rebuilt bundle.
  const traces = (bundle.match(/chronodivide/gi) || []).length;
  console.log("  'chronodivide' occurrences in bundle: " + traces + " (expect 0)");
}

main();
