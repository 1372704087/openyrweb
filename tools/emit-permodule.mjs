#!/usr/bin/env node
/**
 * tools/emit-permodule.mjs — 把 build/dist/ra2web.js 里的全部 System.register
 * 模块还原为 build/<模块名> 无扩展名单文件（客户端逐模块 XHR 加载所需的布局）。
 *
 * 背景：客户端 index.html 走 SystemJS.import("main") 逐文件加载；`npm run build`
 * 的全量重建只产出单体 bundle，缺逐模块文件 → 浏览器 404。本脚本从 bundle 原文
 * 恢复该布局：模块在 bundle 内严格顺序排列，边界=下一个 marker 起点，无需词法器。
 *
 * Usage: node tools/emit-permodule.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "build", "dist", "ra2web.js");
const OUT = join(ROOT, "build");

const src = readFileSync(SRC, "utf8");
const MARKER = 'System.register("';

// 1. 收集全部 marker 起点
const starts = [];
let p = 0;
while (true) {
  const i = src.indexOf(MARKER, p);
  if (i < 0) break;
  starts.push(i);
  p = i + MARKER.length;
}
if (starts.length === 0) {
  console.error("no System.register found in " + SRC);
  process.exit(1);
}

// 2. 每个模块的文本 = [marker 起点, 下一个 marker 起点)，最后一块到文件尾。
//    片段尾部含 `);` 与空白，作为合法 JS 一并写入。
let count = 0;
const names = [];
const skipped = [];
for (let k = 0; k < starts.length; k++) {
  const start = starts[k];
  const end = k + 1 < starts.length ? starts[k + 1] : src.length;
  const nameStart = start + MARKER.length;
  const nameEnd = src.indexOf('"', nameStart);
  const name = src.slice(nameStart, nameEnd);
  const outPath = join(OUT, name);
  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, src.slice(start, end).replace(/\s*$/, "\n"));
    names.push(name);
    count++;
  } catch (e) {
    // Windows 大小写不敏感：裸名模块（如 Gui）与其子路径目录（gui/...）碰撞时跳过，
    // 客户端对这些模块不走逐文件加载（原部署同此处理）。
    skipped.push(name + " (" + ((e && e.code) || e) + ")");
  }
}
console.log("emitted " + count + " module files under build/");
if (skipped.length) console.log("skipped: " + skipped.join(", "));

// 3. 补发 ts-modules 里 bundle 没有的模块（repack 按原版模块清单重组，
//    新增 TS 模块会被丢掉——正是浏览器 404 的那批）。
const TSM = join(ROOT, "build", "ts-modules");
function walkTsModules(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkTsModules(full));
    else if (e.name.endsWith(".js")) out.push(full);
  }
  return out;
}
let extra = 0;
for (const file of walkTsModules(TSM)) {
  const rel = file.slice(TSM.length + 1).replace(/\.js$/, "").replace(/\\/g, "/");
  if (names.indexOf(rel) >= 0) continue;
  const outPath = join(OUT, rel);
  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, readFileSync(file));
    names.push(rel);
    extra++;
  } catch (e) {
    console.log("  skip ts-module " + rel + ": " + ((e && e.code) || e));
  }
}
console.log("extra ts-modules emitted: " + extra);
const must = [
  "main",
  "game/ai/AiTriggerRuntime",
  "game/ai/Randomizer",
  "game/ai/AiTeamRuntime",
  "game/ai/AiProductionRuntime",
  "game/ai/AiSuperWeaponRuntime",
  "game/ai/AiEngine",
];
for (const m of must) {
  console.log((names.indexOf(m) >= 0 ? "  OK " : "  MISSING ") + m);
}
