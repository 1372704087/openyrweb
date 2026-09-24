#!/usr/bin/env node
/** Audit: whole-module aliases that should extract a named export. */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";

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

const files = walk(SRC);
const bugs = [];

for (const f of files) {
  const s = readFileSync(f, "utf8");
  const importRe = /import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']/g;
  const modLocalToId = new Map();
  let m;
  while ((m = importRe.exec(s))) modLocalToId.set(m[1], m[2]);

  const aliasRe = /const\s+(\w+):\s*any\s*=\s*(\w+)\s+as\s+any\s*;/g;
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

    // Sibling exports that might be accessed via Local.Sibling (module-level)
    const siblings = [...exps].filter((x) => x !== local);
    // Heuristic: if usage is only Local.X where X is a sibling export name, whole-module is OK
    // If usage includes static methods / instanceof / new, need .Local
    const siblingOnly =
      siblings.length > 0 &&
      usesInst === 0 &&
      usesNew === 0 &&
      (() => {
        const re = new RegExp("\\b" + local + "\\.([A-Za-z_$][\\w$]*)", "g");
        let mm;
        let allSibling = true;
        while ((mm = re.exec(s))) {
          if (!siblings.includes(mm[1]) && !exps.has(mm[1])) {
            allSibling = false;
            break;
          }
          if (!siblings.includes(mm[1])) {
            // matches another export that isn't a sibling? treat as class member
            allSibling = false;
            break;
          }
        }
        return allSibling;
      })();

    if (siblingOnly) continue;

    bugs.push({
      file: relative(ROOT, f).replace(/\\/g, "/"),
      local,
      modId,
      exports: [...exps],
      usesStatic,
      usesInst,
      usesNew,
      line: s.slice(0, m.index).split("\n").length,
    });
  }
}

const seen = new Set();
for (const b of bugs) {
  const k = b.file + ":" + b.local;
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(
    `${b.file}:${b.line}  const ${b.local} = module  [${b.modId}] exports=[${b.exports}] use static=${b.usesStatic} inst=${b.usesInst} new=${b.usesNew}`,
  );
}
console.log("total unique suspects:", seen.size);
