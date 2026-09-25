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
 *   - B 里出现重复登记 / 快照里残留旧探针的孤儿键（探针被换过、旧值还在做基线）；
 *   - static factory 丢掉孪生参数交换（如 HtmlReactElement.factory(Component, options)
 *     被写成 factory(options, Component)）—— 签名 arity 相同，tsc/parity 形状探针全绿，
 *     运行时组件/props 颠倒才炸。
 *
 * 用法：
 *   node tools/quality-audit.mjs           # 有硬失败时退出码 1
 *   node tools/quality-audit.mjs --list    # 额外列出全部「弱探针」/缺 factory 探针模块
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
  index: m.index,
}));

function probesOf(name) {
  // 必须匹配 name 字段：裸 "path" 会命中别的探针里的 mod("path") 首次出现
  const at = paritySrc.indexOf(`name: "${name}"`);
  if (at < 0) return null;
  const pi = paritySrc.indexOf("probes:", at);
  if (pi < 0 || pi - at > 200) return null;
  return sliceBracket(paritySrc, paritySrc.indexOf("[", pi));
}
const probeCount = (pr) => (pr.match(/=>/g) || []).length;

/** 去掉 TS 类型注解后的形参名列表。 */
function paramNames(paramSrc) {
  return paramSrc
    .split(",")
    .map((p) => p.trim().replace(/:.*/, "").trim())
    .filter(Boolean);
}

/**
 * 比对 static factory 的调用参数顺序（TS 源码 ⇄ 孪生）。
 * 返回 mismatch 列表；解析失败（单侧无 factory）则跳过。
 */
function factoryOrderMismatches() {
  const out = [];
  for (const e of entries) {
    const tsPath = path.join(ROOT, "src", e.name + ".ts");
    const twPath = path.join(ROOT, "src", e.name + ".ts.js");
    if (!fs.existsSync(tsPath) || !fs.existsSync(twPath)) continue;
    const ts = fs.readFileSync(tsPath, "utf8");
    const tw = fs.readFileSync(twPath, "utf8");
    const tsM = ts.match(/static\s+factory\s*\(([^)]*)\)[^{]*\{([\s\S]{0,500}?)\n  \}/);
    const twM = tw.match(/static\s+factory\s*\(([^)]*)\)\s*\{([\s\S]{0,500}?)\}/);
    if (!tsM || !twM) continue;
    const pT = paramNames(tsM[1]);
    const pW = paramNames(twM[1]);
    const cT =
      (tsM[2].match(/new\s+\(this as any\)\(([^)]*)\)/) ||
        tsM[2].match(/new this\(([^)]*)\)/) ||
        [])[1];
    const cW = (twM[2].match(/new this\(([^)]*)\)/) || [])[1];
    if (cT == null || cW == null || pT.length < 2 || pT.length !== pW.length) continue;
    const aT = cT.split(",").map((s) => s.trim()).filter(Boolean);
    const aW = cW.split(",").map((s) => s.trim()).filter(Boolean);
    if (aT.length !== aW.length || aT.length < 2) continue;
    const oT = aT.map((a) => pT.indexOf(a));
    const oW = aW.map((a) => pW.indexOf(a));
    // 形参下标序列不一致 ⇒ 交换语义与孪生不同（HtmlReactElement 类 bug）
    if (JSON.stringify(oT) !== JSON.stringify(oW)) {
      // 仅当两侧都在用形参变量（不是字面量）时才算交换差异
      if (oT.every((x) => x >= 0) && oW.every((x) => x >= 0)) {
        out.push(
          `${e.name}: factory(${pT}) → (${aT}) order=${oT} vs twin factory(${pW}) → (${aW}) order=${oW}`,
        );
      }
    }
  }
  return out;
}

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
const twinOnDisk = entries.length - noTwin.length;
if (unregistered.length) fail(`磁盘有 .ts 但未登记 parity：${unregistered.join(", ")}`);
if (noProduct.length) fail(`登记了但磁盘无 .ts：${noProduct.map((e) => e.name).join(", ")}`);
// 孪生全部删除 = 迁移终态，oracle 移交给 tests/parity-snapshots.json；只拦「删了一半」的混合状态。
if (noTwin.length && twinOnDisk > 0)
  fail(`登记了但无孪生（混合状态，快照 oracle 需确认）：${noTwin.map((e) => e.name).join(", ")}`);
else if (noTwin.length === entries.length)
  console.log("  ℹ 孪生已全部删除（迁移终态），oracle = tests/parity-snapshots.json");
if (!unregistered.length && !noProduct.length && (!noTwin.length || twinOnDisk === 0) && !dupes.length)
  console.log("  ✓ 双向一致");

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
      `node_modules/${spec}`,        // npm 裸包目录（如 mersenne-twister）
      `node_modules/${spec}.js`,     // 深层文件路径（如 .../lib/adapters/cache）
      `node_modules/${spec}.mjs`,
      `node_modules/${spec}.cjs`,
      `node_modules/${spec}/index.js`,
      `node_modules/${spec}/index.mjs`,
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

// ---------------------------------------------------------------- 4b. static factory 必须有调用/引用探针
console.log("\n=== 4b. static factory ⇄ 探针覆盖 ===");
const noFactoryProbe = [];
for (const e of entries) {
  const tsPath = path.join(ROOT, "src", e.name + ".ts");
  if (!fs.existsSync(tsPath)) continue;
  const src = fs.readFileSync(tsPath, "utf8");
  if (!/static\s+factory\s*\(/.test(src)) continue;
  const pr = probesOf(e.name);
  if (pr === null) continue;
  if (!/factory/.test(pr)) noFactoryProbe.push(e.name);
}
if (noFactoryProbe.length) {
  fail(
    `含 static factory 但探针未引用 factory（装配顺序/交换语义零覆盖）${noFactoryProbe.length} 个：` +
      noFactoryProbe.join(", "),
  );
} else {
  console.log("  ✓ 全部 static factory 模块的探针都触及 factory");
}

// ---------------------------------------------------------------- 4c. factory 参数顺序（源码 ⇄ 孪生）
console.log("\n=== 4c. static factory 参数顺序（TS ⇄ 孪生）===");
const orderBad = factoryOrderMismatches();
if (orderBad.length) {
  for (const m of orderBad) fail(m);
} else {
  console.log("  ✓ 两参及以上 factory 的 new this(...) 形参顺序与孪生一致");
}

// ---------------------------------------------------------------- 4d. 模块级 sibling 导出 ⇄ 类静态误用
// 真实事故：WolConfig.ClientType / MapSurface.MAGIC_OFFSET / Vehicle.ROCKING_TICKS —
// 宿主是「从命名空间解包或具名 import 的类」，sibling 却是模块级 export。
// 跳过：export namespace 合并（GservError.Code）、整命名空间绑定（import * as / const X = XNs）。
console.log("\n=== 4d. 模块级 sibling 导出 ⇄ 类静态误用 ===");
const siblingMisuse = [];
{
  const classInfo = new Map();
  for (const f of disk) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    const classes = [...text.matchAll(/export\s+class\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    const sibs = [...text.matchAll(/export\s+(?:enum|const|let|var)\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    const nsNames = new Set([...text.matchAll(/export\s+namespace\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]));
    for (const cls of classes) {
      if (nsNames.has(cls)) continue;
      const idx = text.indexOf("export class " + cls);
      if (idx < 0) continue;
      const rest = text.slice(idx);
      const nl = rest.slice(10).search(/\nexport\s/);
      const body = nl >= 0 ? rest.slice(0, 10 + nl) : rest;
      const nonStatic = sibs.filter(
        (sib) => sib !== cls && !new RegExp(`static\\s+(?:readonly\\s+)?${sib}\\b`).test(body),
      );
      if (nonStatic.length) classInfo.set(cls, new Set(nonStatic));
    }
  }
  for (const f of disk) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const [cls, nonStatic] of classInfo) {
      const bindsClass =
        new RegExp(`const\\s+${cls}\\b[^=;]*=\\s*\\(\\s*\\w+\\s+as\\s+any\\s*\\)\\.\\s*${cls}\\b`).test(text) ||
        new RegExp(`import\\s*\\{[^}]*\\b${cls}\\b[^}]*\\}\\s*from`).test(text);
      if (!bindsClass) continue;
      for (const sib of nonStatic) {
        if (new RegExp(`\\b${cls}\\.${sib}\\b`).test(text)) {
          siblingMisuse.push(`${f}: ${cls}.${sib}（${sib} 是模块级导出，不是 ${cls} 静态）`);
        }
      }
    }
  }
  const seen = new Set();
  for (const m of siblingMisuse) {
    if (seen.has(m)) continue;
    seen.add(m);
    fail(m);
  }
  if (!seen.size) console.log("  ✓ 未发现模块级导出被误挂到类（具名 import / 命名空间解包类）");
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

// ---------------------------------------------------------------- 6. 双文件注释（有孪生的 .ts）
console.log("\n=== 6. 双文件并存注释 ===");
let dualMissing = 0;
let dualNoTwin = 0;
for (const f of disk) {
  const twin = f + ".js";
  const full = path.join(ROOT, f);
  const hasTwin = fs.existsSync(path.join(ROOT, twin));
  const text = fs.readFileSync(full, "utf8");
  const hasNote = text.includes("两个文件并存期间");
  if (hasTwin && !hasNote) {
    dualMissing++;
    if (LIST || dualMissing <= 5) warn(`${f} 有孪生但缺少「两个文件并存期间」注释`);
  } else if (!hasTwin && !f.startsWith("src/extensions/") && hasNote) {
    dualNoTwin++;
  }
}
console.log(`  有孪生缺注释 ${dualMissing} 个／注释声明有孪生但磁盘无孪生 ${dualNoTwin} 个`);
if (dualMissing) {
  // 历史批次欠账：列表过长时只 warn 数量，--list 看全量；新增文件应带上注释
  warn("新转换文件必须带「两个文件并存期间…」注释（指明 .ts 是修改目标）；历史欠账用 --list 查看。");
}

// ---------------------------------------------------------------- 汇总
console.log("");
if (problems.length) {
  console.log(`FAIL：${problems.length} 项硬失败`);
  process.exit(1);
}
console.log(`OK：0 项硬失败（磁盘 .ts ${disk.length}，parity 登记 ${names.length}）`);
