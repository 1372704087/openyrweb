#!/usr/bin/env node
/**
 * tools/compile-ts.mjs — Compile TS-converted modules (the .ts rewrites under
 * src/) into bundle-ready SystemJS register files (build/ts-modules/<name>.js).
 *
 * Pipeline:
 *   1. tsc -p tsconfig.json        TS sources -> build/ts-out (mirrored layout)
 *      (module:"system"; TS sources import deps by canonical bundle names,
 *       e.g. "game/math/Vector2" — see src/modules.d.ts for the any-shims.)
 *   2. Canonicalize each emitted register:
 *        System.register([deps], ...)                      // anonymous, relative deps
 *      -> System.register("game/Coords", ["game/..."], ...)  // named, canonical deps
 *      so the output is drop-in interchangeable with the reconstructed .ts.js
 *      modules that tools/repack.mjs concatenates.
 *
 * The output of this script is consumed by tools/repack.mjs, which prefers
 * build/ts-modules/<name>.js over src/<name>.ts.js for every converted module.
 *
 * Usage: node tools/compile-ts.mjs        (or: npm run build:ts)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const TSC = join(ROOT, "node_modules", "typescript", "bin", "tsc");
const TS_OUT = join(ROOT, "build", "ts-out");
const TS_MODULES = join(ROOT, "build", "ts-modules");

function runTsc() {
  if (!existsSync(TSC)) {
    console.error("typescript not installed — run: npm install");
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [TSC, "-p", "tsconfig.json"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) throw new Error("tsc failed");
}

/** SystemJS resolves a relative specifier against the importing module's name. */
function resolveDep(fromName, spec) {
  if (!spec.startsWith(".")) return spec;
  const parts = fromName.split("/");
  parts.pop();
  for (const seg of spec.split("/")) {
    if (seg === "." || seg === "") continue;
    else if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts.join("/");
}

/** Rewrite one emitted file: inject the canonical register name + canonical deps. */
function canonicalize(inPath, name) {
  let code = readFileSync(inPath, "utf8");
  const idx = code.indexOf("System.register(");
  if (idx < 0) throw new Error(`No System.register emitted in ${inPath}`);
  let i = idx + "System.register(".length;
  while (/\s/.test(code[i])) i++;

  if (code[i] === "[") {
    code = code.slice(0, i) + `"${name}", ` + code.slice(i);
  } else if (code[i] === '"') {
    // Already named (e.g. different tsc emit behavior): only accept a matching name.
    const m = /^"([^"]+)"/.exec(code.slice(i));
    if (!m || m[1] !== name)
      throw new Error(
        `Register name mismatch in ${inPath}: got ${m && m[1]}, want ${name}`,
      );
  } else {
    throw new Error(`Unexpected token after System.register( in ${inPath}`);
  }

  // Canonicalize relative deps inside the (first) dependency array.
  const depsStart = code.indexOf("[", i);
  const depsEnd = code.indexOf("]", depsStart);
  const depsBody = code.slice(depsStart + 1, depsEnd);
  const newDeps = depsBody.replace(/"([^"]+)"/g, (whole, spec) => {
    const resolved = resolveDep(name, spec);
    return `"${resolved}"`;
  });
  code = code.slice(0, depsStart + 1) + newDeps + code.slice(depsEnd);
  return code;
}

function main() {
  runTsc();

  rmSync(TS_MODULES, { recursive: true, force: true });
  mkdirSync(TS_MODULES, { recursive: true });

  let count = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js")) {
        const rel = relative(TS_OUT, full).replace(/\\/g, "/");
        const name = rel.replace(/\.js$/, "");
        const out = canonicalize(full, name);
        const outPath = join(TS_MODULES, name + ".js");
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, out);
        count++;
        console.log("  " + name);
      }
    }
  };
  walk(TS_OUT);
  console.log(`Compiled ${count} TS module(s) -> build/ts-modules/`);
}

main();
