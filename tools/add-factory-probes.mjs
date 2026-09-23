/**
 * 为「源码有 static factory、探针未出现 factory」的登记项插入一条 arity 探针。
 * 幂等。
 */
import fs from "node:fs";
import path from "node:path";

const PARITY = path.join(process.cwd(), "tests/ts-parity.mjs");
let src = fs.readFileSync(PARITY, "utf8");

function findEntry(name) {
  const key = `name: "${name}"`;
  const at = src.indexOf(key);
  if (at < 0) return null;
  const pi = src.indexOf("probes:", at);
  if (pi < 0) return null;
  const open = src.indexOf("[", pi);
  let d = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "[") d++;
    else if (src[j] === "]") {
      if (--d === 0) return { open, close: j, body: src.slice(open + 1, j) };
    }
  }
  return null;
}

function exportNameOf(code, base) {
  const m =
    code.match(/export\s+(?:default\s+)?class\s+([A-Za-z0-9_]+)/) ||
    code.match(/export\s+(?:default\s+)?(?:const|function|let|var)\s+([A-Za-z0-9_]+)/);
  return m ? m[1] : base;
}

// Collect missing first (indices shift after each insert — resolve by name each time)
const names = [...src.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
let patched = 0;
const still = [];

for (const name of names) {
  const tsPath = path.join(process.cwd(), "src", name + ".ts");
  if (!fs.existsSync(tsPath)) continue;
  const code = fs.readFileSync(tsPath, "utf8");
  if (!/static\s+factory\s*\(/.test(code)) continue;
  const entry = findEntry(name);
  if (!entry) {
    still.push(name + " (no entry)");
    continue;
  }
  if (/factory/.test(entry.body)) continue;

  const base = name.split("/").pop();
  const exportName = exportNameOf(code, base);
  const probe =
    `\n      (ns) => {\n` +
    `        // factory 装配面：锁定存在性与 arity（调用顺序见 quality-audit 4c）\n` +
    `        const F = ns[${JSON.stringify(exportName)}] && ns[${JSON.stringify(exportName)}].factory;\n` +
    `        return { type: typeof F, arity: F ? F.length : -1 };\n` +
    `      },`;
  // insert before closing ]
  let insert = probe;
  // ensure previous last probe ends with comma
  const bodyTrim = entry.body.replace(/\s+$/, "");
  if (bodyTrim && !bodyTrim.endsWith(",")) insert = "," + insert;
  src = src.slice(0, entry.close) + insert + "\n    " + src.slice(entry.close);
  patched++;
}

fs.writeFileSync(PARITY, src, "utf8");
console.log("patched", patched);

// recheck
src = fs.readFileSync(PARITY, "utf8");
const missing = [];
for (const m of src.matchAll(/name: "([^"]+)"/g)) {
  const name = m[1];
  const tsPath = path.join(process.cwd(), "src", name + ".ts");
  if (!fs.existsSync(tsPath)) continue;
  const code = fs.readFileSync(tsPath, "utf8");
  if (!/static\s+factory\s*\(/.test(code)) continue;
  const entry = findEntry(name);
  if (!entry || !/factory/.test(entry.body)) missing.push(name);
}
console.log("missing after", missing.length, missing);
