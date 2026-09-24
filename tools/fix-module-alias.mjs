#!/usr/bin/env node
/**
 * Fix whole-module aliases that should extract a named export:
 *   const X: any = XModule as any;
 * -> const X: any = (XModule as any).X;
 *
 * Only rewrites when the alias name matches a real export of that module
 * and the alias is used as a class (static / instanceof / new).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");
const TS_OUT = join(ROOT, "build", "ts-out");

function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".ts") && !e.name.endsWith(".ts.js")) out.push(p);
  }
  return out;
}

function exportsOf(modId) {
  const p = join(TS_OUT, modId + ".js");
  if (!existsSync(p)) return null;
  const s = readFileSync(p, "utf8");
  const names = new Set();
  const re = /exports_1\(\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(s))) names.add(m[1]);
  return names;
}

let fixedCount = 0;
let fileCount = 0;

for (const f of walk(SRC)) {
  let s = readFileSync(f, "utf8");
  const orig = s;

  const importRe = /import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']/g;
  const modLocalToId = new Map();
  let m;
  while ((m = importRe.exec(s))) modLocalToId.set(m[1], m[2]);

  const aliasRe = /const\s+(\w+):\s*any\s*=\s*(\w+)\s+as\s+any\s*;/g;
  const replacements = [];
  while ((m = aliasRe.exec(s))) {
    const local = m[1];
    const modLocal = m[2];
    const modId = modLocalToId.get(modLocal);
    if (!modId) continue;
    const exps = exportsOf(modId);
    if (!exps || !exps.has(local)) continue;

    const usesStatic = (s.match(new RegExp("\\b" + local + "\\.[A-Za-z_$]", "g")) || []).length;
    const usesInst = (s.match(new RegExp("instanceof\\s+" + local + "\\b", "g")) || []).length;
    const usesNew = (s.match(new RegExp("new\\s+" + local + "\\b", "g")) || []).length;
    if (usesStatic + usesInst + usesNew === 0) continue;

    // Skip intentional whole-module aliases used only as namespace (hooks, MeshLineNS, A)
    // Already filtered by export name match.

    replacements.push({
      start: m.index,
      end: m.index + m[0].length,
      text: `const ${local}: any = (${modLocal} as any).${local};`,
      local,
      modId,
    });
  }

  if (!replacements.length) continue;

  // Apply from end so indices stay valid
  replacements.sort((a, b) => b.start - a.start);
  for (const r of replacements) {
    s = s.slice(0, r.start) + r.text + s.slice(r.end);
    fixedCount++;
    console.log(`  ${r.local} <- ${r.modId}  in ${relative(ROOT, f)}`);
  }
  if (s !== orig) {
    writeFileSync(f, s);
    fileCount++;
  }
}

console.log(`\nFixed ${fixedCount} alias(es) in ${fileCount} file(s).`);
