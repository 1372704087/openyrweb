/**
 * 转写批次门禁（oracle 版）—— 审查/提交前先跑这个。
 *
 * 设计原则：每一项都必须拿「仓库自己的两个事实来源」互相比对，不能只看某个文件
 * 「像不像有问题」。三个事实来源：
 *   A = 磁盘上的 src/**.ts（重建包部分）
 *   B = tests/ts-parity.mjs 的 CONVERTED 登记 + tests/parity-snapshots.json 快照
 *   C = tools/generate-rule-ts.mjs 的 DESC（生成器清单）
 *
 * 为什么需要它：tsc / parity / build 全绿挡不住下面这些（每一项都真实发生过）——
 *   - C 里的条目在磁盘上没有对应 .ts：无参调用生成器会产出一批「给 import 赋值」的
 *     坏文件，叠加 noEmitOnError 后 repack 静默回退孪生 ⇒ 整批转换白做；
 *   - 探针只写 `typeof ns.X`：快照里记的就是 "function"，把模块换成空壳也照样 PASS
 *     （行为零覆盖）—— 漏掉运行时缺陷的头号原因；
 *   - B 里出现重复登记 / 快照里残留旧探针的孤儿键（探针被换过、旧值还在做基线）。
 *
 * 用法：
 *   node tools/quality-audit.mjs           # 有硬失败时退出码 1
 *   node tools/quality-audit.mjs --list    # 额外列出全部「弱探针」模块
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIST = process.argv.includes("--list");
const PARITY = path.join(ROOT, "tests/ts-parity.mjs");
const SNAPSHOT = path.join(ROOT, "tests/parity-snapshots.json");
const RULES_GEN = path.join(ROOT, "tools/generate-rule-ts.mjs");

const problems = [];
const warn = (msg) => console.log(`  ⚠ ${msg}`);
const fail = (msg) => { problems.push(msg); console.log(`  ❌ ${msg}`); };

/** 收集 src 下全部转写产物（不含 .d.ts）。 */
function walkTs(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir + "/" + e.name;
    if (e.isDirectory()) walkTs(rel, out);
    else if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) out.push(rel);
  }
  return out;
}

/** 括号配对取出 probes 数组源码 —— 非贪婪正则会截早。 */
function sliceBracket(text, openIdx) {
  let d = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === "[") d++;
    else if (text[i] === "]") { if (--d === 0) return text.slice(openIdx + 1, i); }
  }
  return "";
}

const paritySrc = fs.readFileSync(PARITY, "utf8");
const entries = [...paritySrc.matchAll(/\{\s*\n?\s*name:\s*"([^"]+)",\s*\n?\s*tsjs:\s*"([^"]+)"/g)].map((m) => ({
  name: m[1],
  tsjs: m[2],
}));

function probesOf(name) {
  const at = paritySrc.indexOf(`"${name}"`);
  if (at < 0) return null;
  const pi = paritySrc.indexOf("probes:", at);
  if (pi < 0) return null;
  return sliceBracket(paritySrc, paritySrc.indexOf("[", pi));
}
const probeCount = (pr) => (pr.match(/=>/g) || []).length;

// ---------------------------------------------------------------- 1. 登记 ⇄ 磁盘
console.log("=== 1. parity 登记 ⇄ 磁盘 .ts ===");
const disk = walkTs("src").sort();
const recon = disk.filter((f) => !f.startsWith("src/extensions/"));
const names = entries.map((e) => e.name);
const registered = new Set(names);
console.log(`  登记 ${names.length}（去重 ${registered.size}）／磁盘 ${disk.length}（重建包 ${recon.length} / extensions ${disk.length - recon.length}）`);
console.log("  注：src/extensions/** 是扩展层新源码、没有孪生，不参与登记比对。");
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
if (dupes.length) fail(`CONVERTED 重复登记 ${dupes.length} 条：${[...new Set(dupes)].join(", ")}（非幂等的插入脚本会导致）`);
const unregistered = recon.filter((f) => !registered.has(f.slice(4).replace(/\.ts$/, "")));
const noProduct = entries.filter((e) => !fs.existsSync(path.join(ROOT, "src", e.name + ".ts")));
const noTwin = entries.filter((e) => !fs.existsSync(path.join(ROOT, "src", e.name + ".ts.js")));
if (unregistered.length) fail(`磁盘有 .ts 但未登记 parity：${unregistered.join(", ")}`);
if (noProduct.length) fail(`登记了但磁盘无 .ts：${noProduct.map((e) => e.name).join(", ")}`);
if (noTwin.length) fail(`登记了但无孪生（快照失去 oracle）：${noTwin.map((e) => e.name).join(", ")}`);
if (!unregistered.length && !noProduct.length && !noTwin.length && !dupes.length) console.log("  ✓ 双向一致");

// ---------------------------------------------------------------- 2. 生成器 DESC ⇄ 产物
console.log("\n=== 2. 生成器 DESC ⇄ 产物 ===");
if (fs.existsSync(RULES_GEN)) {
  const g = fs.readFileSync(RULES_GEN, "utf8");
  const body = g.slice(g.indexOf("const DESC = {"), g.indexOf("};", g.indexOf("const DESC = {")));
  const keys = [...body.matchAll(/^  "([^"]+)":/gm)].map((m) => m[1]);
  const dead = keys.filter((k) => !fs.existsSync(path.join(ROOT, "src", k + ".ts")));
  console.log(`  DESC 条目 ${keys.length}`);
  if (dead.length) fail(`条目在磁盘上没有产物（无参调用会生成坏文件）：${dead.join(", ")}`);
  else console.log("  ✓ 全部条目都有对应 .ts");
} else {
  fail("tools/generate-rule-ts.mjs 不存在");
}

// ---------------------------------------------------------------- 3. 断链 import
console.log("\n=== 3. 断链 import ===");
let broken = 0;
let checked = 0;
for (const f of disk) {
  const content = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of content.matchAll(/from\s+["']([^"']+)["']/g)) {
    const spec = m[1];
    checked++;
    if (spec.startsWith(".")) continue; // 相对路径交给 tsc
    const candidates = [
      `src/${spec}.ts`,
      `src/${spec}.ts.js`,
      `build/ts-modules/${spec}.js`,
      `node_modules/${spec}`,        // npm 裸包（如 mersenne-twister）
    ];
    if (!candidates.some((c) => fs.existsSync(path.join(ROOT, c)))) {
      broken++;
      fail(`${f} → "${spec}"`);
    }
  }
}
if (!broken) console.log(`  ✓ ${checked} 条 import 全部可解析（含 node_modules 裸包）`);

// ---------------------------------------------------------------- 4. 探针强度
console.log("\n=== 4. 探针强度（行为零覆盖）===");
/** 常量 / 类型断言 —— 这类探针换成空壳实现照样通过。
 *  只认「单表达式箭头」：块体箭头（`=> { … }`）说明探针真的在干活，不算弱。 */
const WEAK = /=>[ \t]*(?!\{)(?:typeof\s|["'\d]|Object\.(?:values|keys)\(|-)/g;
const weakMods = [];
for (const e of entries) {
  const pr = probesOf(e.name);
  if (pr === null) continue;
  const total = (pr.match(/=>/g) || []).length;
  const weakN = (pr.match(WEAK) || []).length;
  if (total > 0 && weakN === total) weakMods.push(e.name);
}
console.log(`  ${weakMods.length} / ${entries.length} 个模块的探针全部是常量或类型断言`);
if (weakMods.length) {
  warn("这类模块的 parity 只能证明「模块存在且导出了东西」，不能证明行为一致 —— 需要真正驱动方法（见 tests/ts-parity.mjs 里 Quaternion/DriveLocomotor 的写法）。");
  for (const m of LIST ? weakMods : weakMods.slice(0, 8)) console.log("     · " + m);
  if (!LIST && weakMods.length > 8) console.log(`     …（共 ${weakMods.length} 个，加 --list 看全部）`);
}

// ---------------------------------------------------------------- 5. 快照孤儿键
console.log("\n=== 5. parity 快照孤儿键 ===");
try {
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  let orphans = 0;
  let errorEntries = 0;
  for (const e of entries) {
    const store = snap[e.name];
    if (!store) continue;
    const n = probeCount(probesOf(e.name) || "");
    if (Object.keys(store).length > n) {
      orphans++;
      warn(`${e.name}: 快照 ${Object.keys(store).length} 键 / 探针 ${n} 条 -> ${JSON.stringify(store)}`);
    }
    for (const v of Object.values(store)) if (v && typeof v === "object" && "__error__" in v) errorEntries++;
  }
  console.log(`  孤儿键模块 ${orphans} 个／快照里存了 __error__ 的探针条目 ${errorEntries} 条`);
  if (errorEntries) warn("两侧抛同一个错也算 PASS —— 新增探针捕获到错误时必须人工确认它是「有意的错误断言」而不是探针写坏了。");
} catch (e) {
  fail("读取 tests/parity-snapshots.json 失败: " + String(e).slice(0, 120));
}

// ---------------------------------------------------------------- 汇总
console.log("");
if (problems.length) {
  console.log(`FAIL：${problems.length} 项硬失败`);
  process.exit(1);
}
console.log(`OK：0 项硬失败（磁盘 .ts ${disk.length}，parity 登记 ${names.length}）`);
