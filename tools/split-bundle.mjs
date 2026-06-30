#!/usr/bin/env node
/**
 * split-bundle.mjs — Split the Chrono Divide SystemJS bundle into per-module files.
 *
 * Purpose (A2, core RE deliverable): turn the minified `dist/ra2web.min.js` (1218
 * System.register modules) into one navigable file per module under src-reconstructed/,
 * so the engine source becomes readable and modifiable.
 *
 * Bundle format (verified): every module is exactly
 *     System.register("name",["dep","dep2",...],function(e,t){"use strict";...})
 * Module names are clean [A-Za-z0-9/_-]. No registerDynamic, no array-first form.
 *
 * Strategy: a hand-written JS lexer that tracks string / template / regex / comment /
 * brace depth, so we split on module boundaries at brace-depth zero — never inside a
 * string or regex. We also capture the runtime-helper prelude (everything before the
 * first System.register) into _runtime/.
 *
 * Usage:
 *   node tools/split-bundle.mjs                 # split + write _module-map.json
 *   node tools/split-bundle.mjs --no-beautify   # skip prettier step (faster)
 *   node tools/split-bundle.mjs --vendor        # also split vendor.bundle.min.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "client", "dist", "ra2web.min.js");
const OUT = join(ROOT, "src-reconstructed");
const NO_BEAUTIFY = true; // beautify done in a separate fast batch pass via `npm run beautify`
const DO_VENDOR = process.argv.includes("--vendor");

// --- 1. Lexical scanner: find balanced closing brace of a function body -----------
// Returns index just past the closing brace of the factory function.
function findFunctionBodyEnd(src, braceOpen) {
  let i = braceOpen;
  let depth = 0;
  let state = "code"; // code | sq | dq | template | lineComment | blockComment | regex | regexClass
  const n = src.length;
  let prevSignificant = "("; // regex detection needs previous significant token; "(" => division cannot follow => it's a regex

  const isRegexAllowedAfter = (ch) =>
    // A regex literal can start if the previous significant char is NOT an operand/identifier/closing-bracket.
    !/[0-9A-Za-z_$)\]]/.test(ch);

  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    if (state === "code") {
      if (c === "/" && next === "/") {
        state = "lineComment";
        i += 2;
        continue;
      }
      if (c === "/" && next === "*") {
        state = "blockComment";
        i += 2;
        continue;
      }
      if (c === '"') {
        state = "dq";
        i++;
        continue;
      }
      if (c === "'") {
        state = "sq";
        i++;
        continue;
      }
      if (c === "`") {
        state = "template";
        i++;
        continue;
      }
      if (c === "/" && isRegexAllowedAfter(prevSignificant)) {
        state = "regex";
        i++;
        continue;
      }
      if (c === "{") {
        depth++;
        prevSignificant = c;
        i++;
        continue;
      }
      if (c === "}") {
        depth--;
        prevSignificant = c;
        i++;
        if (depth === 0) return i; // back to depth 0 == factory body ended
        continue;
      }
      if (!/\s/.test(c)) prevSignificant = c;
      i++;
      continue;
    }

    if (state === "lineComment") {
      if (c === "\n") state = "code";
      i++;
      continue;
    }
    if (state === "blockComment") {
      if (c === "*" && next === "/") {
        state = "code";
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (state === "sq" || state === "dq") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === (state === "sq" ? "'" : '"')) {
        state = "code";
        i++;
        continue;
      }
      i++;
      continue;
    }
    if (state === "template") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      // `${ ... }` — template expression. We treat nested braces to balance; simplest: track depth via a stack.
      if (c === "$" && next === "{") {
        // Switch to a sub-scan: count braces until matched. To keep this simple we recurse-style inline.
        // We'll just switch to a "templateExpr" handling by pushing a marker.
        state = "templateExpr";
        i += 2;
        continue;
      }
      if (c === "`") {
        state = "code";
        i++;
        continue;
      }
      i++;
      continue;
    }
    if (state === "templateExpr") {
      // crude: count { } to know when the expression ends, then return to template.
      // Implemented by scanning forward with the same machine would be ideal; here we do a brace counter.
      let d = 1;
      i;
      while (i < n && d > 0) {
        const cc = src[i];
        if (cc === "{") d++;
        else if (cc === "}") d--;
        i++;
      }
      state = "template";
      continue;
    }
    if (state === "regex") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "[") {
        state = "regexClass";
        i++;
        continue;
      }
      if (c === "/") {
        // consume flags
        i++;
        while (i < n && /[a-z]/i.test(src[i])) i++;
        state = "code";
        prevSignificant = "/";
        continue;
      }
      i++;
      continue;
    }
    if (state === "regexClass") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "]") {
        state = "regex";
        i++;
        continue;
      }
      i++;
      continue;
    }
    // unreachable
    i++;
  }
  return -1; // unbalanced
}

// --- 2. Parse all System.register modules -----------------------------------------
function parseRegisterCalls(src) {
  const modules = [];
  const re = /System\.register\(/g;
  let m;
  let firstRegisterStart = null;
  while ((m = re.exec(src)) !== null) {
    const start = m.index;
    if (firstRegisterStart === null) firstRegisterStart = start;

    let i = m.index + m[0].length;
    // skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++;
    // must be a string literal (module name)
    if (src[i] !== '"') {
      // not the named form; skip
      continue;
    }
    // read module name
    const nameStart = i + 1;
    let nameEnd = nameStart;
    while (nameEnd < src.length && src[nameEnd] !== '"') {
      if (src[nameEnd] === "\\") nameEnd++; // escape (rare for clean names)
      nameEnd++;
    }
    const name = src.slice(nameStart, nameEnd);
    i = nameEnd + 1;
    // skip whitespace then ','
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== ",") continue;
    i++;
    while (i < src.length && /\s/.test(src[i])) i++;
    // deps array
    if (src[i] !== "[") continue;
    const depsStart = i;
    let depsEnd = depsStart + 1;
    let dState = "code";
    while (depsEnd < src.length) {
      const c = src[depsEnd];
      if (dState === "code") {
        if (c === '"') dState = "dq";
        else if (c === "]") {
          break;
        }
      } else if (dState === "dq") {
        if (c === "\\") depsEnd++;
        else if (c === '"') dState = "code";
      }
      depsEnd++;
    }
    const depsRaw = src.slice(depsStart, depsEnd + 1); // includes brackets
    let deps = [];
    try {
      deps = JSON.parse(depsRaw);
    } catch {
      deps = [];
    }
    i = depsEnd + 1;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== ",") continue;
    i++;
    while (i < src.length && /\s/.test(src[i])) i++;
    // factory function — find its opening brace
    // skip function(...) up to first {
    let braceOpen = i;
    while (braceOpen < src.length && src[braceOpen] !== "{") braceOpen++;
    const bodyEnd = findFunctionBodyEnd(src, braceOpen);
    if (bodyEnd === -1) continue;
    // the register call ends with ')' after the factory
    let callEnd = bodyEnd;
    while (callEnd < src.length && /\s/.test(src[callEnd])) callEnd++;
    if (src[callEnd] === ")") callEnd++;
    // optional trailing ';'
    let stmtEnd = callEnd;
    if (src[stmtEnd] === ";") stmtEnd++;

    const callText = src.slice(start, stmtEnd);
    modules.push({ name, deps, start, end: stmtEnd, text: callText });
  }
  return { modules, firstRegisterStart };
}

// --- 3. Module name -> safe path --------------------------------------------------
function nameToPath(name) {
  // Names look like "engine/gfx/Container". Keep verbatim; they're already clean paths.
  // Append .ts.js to signal "reconstructed TS-origin module, JS form".
  return name + ".ts.js";
}

// --- 4. Beautify via prettier (optional) ------------------------------------------
function beautify(code) {
  try {
    const r = spawnSync(
      "npx",
      ["--yes", "prettier", "--parser", "babel", "--print-width", "120"],
      { input: code, encoding: "utf8", maxBuffer: 50 * 1024 * 1024, cwd: ROOT }
    );
    if (r.status === 0 && r.stdout) return r.stdout;
    // prettier may choke on some minified constructs; fall back to input
    return code;
  } catch {
    return code;
  }
}

function splitMain(src, outDir, label) {
  const { modules, firstRegisterStart } = parseRegisterCalls(src);

  // Prelude = everything before the first register (TS runtime helpers etc.)
  const prelude =
    firstRegisterStart !== null ? src.slice(0, firstRegisterStart).trim() : "";

  let written = 0;
  const map = [];

  for (const mod of modules) {
    const relPath = nameToPath(mod.name);
    const outPath = join(outDir, relPath);
    mkdirSync(dirname(outPath), { recursive: true });

    const header = `// === Reconstructed SystemJS module: ${mod.name} ===\n` +
      `// deps: ${mod.deps.length ? JSON.stringify(mod.deps) : "[]"}\n` +
      `// Note: variable/type names are minified approximations of the original TypeScript.\n`;

    let body = mod.text;
    if (!NO_BEAUTIFY) body = beautify(body);
    writeFileSync(outPath, header + "\n" + body + "\n");
    written++;

    map.push({
      name: mod.name,
      file: relPath,
      deps: mod.deps,
      bytes: mod.text.length,
    });
  }

  // Prelude / runtime helpers
  mkdirSync(join(outDir, "_runtime"), { recursive: true });
  const preludeBody = NO_BEAUTIFY ? prelude : beautify(prelude);
  writeFileSync(
    join(outDir, "_runtime", "prelude.ts.js"),
    `// === Bundle prelude: shared TypeScript runtime helpers ===\n` +
      `// __classPrivateFieldGet/Set, __decorate, __createBinding, etc.\n` +
      `// Defined once at the very top of ra2web.min.js before any System.register.\n\n` +
      preludeBody +
      "\n"
  );

  // Module map
  writeFileSync(
    join(outDir, "_module-map.json"),
    JSON.stringify(
      {
        source: label,
        moduleCount: modules.length,
        modules: map,
      },
      null,
      2
    )
  );

  return { written, preludeLen: prelude.length, moduleCount: modules.length };
}

function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`reading ${SRC}`);
  const src = readFileSync(SRC, "utf8");
  const { written, preludeLen, moduleCount } = splitMain(
    src,
    OUT,
    "client/dist/ra2web.min.js"
  );
  console.log(
    `ra2web: wrote ${written} modules + prelude (${preludeLen} bytes) to ${OUT}`
  );

  if (DO_VENDOR) {
    const vendorSrc = join(ROOT, "client", "dist", "vendor.bundle.min.js");
    if (existsSync(vendorSrc)) {
      console.log(`\nreading ${vendorSrc}`);
      // vendor is webpack IIFE; we just beautify it whole for now (split is noted as future work).
      const v = readFileSync(vendorSrc, "utf8");
      const vOut = beautify(v);
      mkdirSync(join(OUT, "_vendor"), { recursive: true });
      writeFileSync(
        join(OUT, "_vendor", "vendor.bundle.ts.js"),
        `// === vendor bundle (webpack IIFE) — beautified whole ===\n// Exposes: react, three.meshline, mersenne-twister, detect-gpu,\n// liang-barsky, file-system-access, @sentry/browser, threads, @puzzl/core, etc.\n// Split by Vo("name", module) registration table is future work.\n\n` +
          vOut +
          "\n"
      );
      console.log("vendor: beautified whole bundle to _vendor/vendor.bundle.ts.js");
    }
  }

  console.log("\nDone. Module map: src-reconstructed/_module-map.json");
}

main();
