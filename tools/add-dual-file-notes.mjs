/**
 * 给「有 .ts.js 孪生但缺少双文件说明」的 .ts 补文件头注释行。
 * 只改注释，不动代码。幂等。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NOTE =
  " * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

let patched = 0;
let skipped = 0;
for (const file of walk(path.join(ROOT, "src"))) {
  const twin = file + ".js";
  if (!fs.existsSync(twin)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("两个文件并存期间")) {
    skipped++;
    continue;
  }

  // 优先：已有块注释头 → 在 */ 前插入一行
  const block = text.match(/^\/\*\*[\s\S]*?\*\//);
  if (block) {
    const head = block[0];
    const next =
      head.replace(/\s*\*\/\s*$/, `\n *\n${NOTE}\n */`) + text.slice(head.length);
    fs.writeFileSync(file, next, "utf8");
    patched++;
    continue;
  }

  // 无块注释：在首个 import/export/声明前插入最小头
  const twinRel = path.relative(ROOT, twin).replace(/\\/g, "/");
  const header = [
    "/**",
    ` * ${path.basename(file, ".ts")} — 见孪生 ${twinRel}。`,
    " *",
    NOTE,
    " */",
    "",
  ].join("\n");
  fs.writeFileSync(file, header + text, "utf8");
  patched++;
}
console.log(`patched=${patched} alreadyHad=${skipped}`);
