import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(f));
    else if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) out.push(f);
  }
  return out;
}

const files = walk("src");
let issues = 0;

// 1. 检查引用是否存在
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const imports = [...content.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]);
  for (const imp of imports) {
    if (imp.startsWith(".")) continue;
    const resolvedTs = path.join("src", imp + ".ts");
    const resolvedTsJs = path.join("src", imp + ".ts.js");
    if (!fs.existsSync(resolvedTs) && !fs.existsSync(resolvedTsJs)) {
      console.log(`BROKEN IMPORT: ${path.relative("src", f)} → "${imp}"`);
      issues++;
    }
  }
}

// 2. 检查 OpenYRWeb 标志残留
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  if (content.includes("OpenYRWeb")) {
    console.log(`OpenYRWeb marker in: ${f}`);
    issues++;
  }
}

// 3. 检查空字段声明（可能被截断的文件）
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const lines = content.split("\n");
  if (lines.length < 5) {
    console.log(`SUSPICIOUSLY SHORT: ${f} (${lines.length} lines)`);
    issues++;
  }
}

// 4. 检查未闭合的花括号
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  let open = 0;
  for (const ch of content) {
    if (ch === "{") open++;
    else if (ch === "}") open--;
  }
  if (open !== 0) {
    console.log(`UNBALANCED BRACES in: ${f} (delta=${open})`);
    issues++;
  }
}

console.log(`\nAudit complete: ${files.length} files, ${issues} issue(s)`);
