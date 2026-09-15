#!/usr/bin/env node
/**
 * tools/generate-rule-ts.mjs — 规则类 .ts.js → .ts 机械转换器（一次性迁移工具）。
 *
 * 针对 rules 层的"键包"类（readIni/parse 里全是 this.X = ini.get(...)）：
 * 把重建孪生里的类体原样提取（含全部语句与注释），做两类安全变换：
 *  1. 模块级压缩变量（var n, o, k...）→ 命名空间导入（import * as M0 from "依赖"），
 *     并在类体内按词边界重命名；
 *  2. readIni(e) / parse(e) 方法参数 e → ini（方法体内部 \be\b 同步改名）。
 * 其余内容一律不改，保证行为逐字等价（tests/ts-parity.mjs 仍会做双实现比对）。
 *
 * 用法：node tools/generate-rule-ts.mjs  （清单写死在 DESC 表中）
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

// 模块名 → { class: 导出类名, desc: 中文头部说明 }
const DESC = {
  "game/rules/CountryRules": { class: "CountryRules", desc: "国家规则（[Countries] 段条目：所属阵营、可玩性、老兵名单）。类外两张静态表：段名→SideType 映射、国家名→UI 文案键。" },
  "game/rules/WeaponRules": { class: "WeaponRules", desc: "武器规则（[WeaponTypes] 段条目：伤害/射速/弹头引用/波束与激光/磁电束表现参数）。" },
  "game/rules/AudioVisualRules": { class: "AudioVisualRules", desc: "音视规则（[AudioVisual] 段：环境光、事件动画与音效、颜色表等全局表现参数）。" },
  "game/rules/WarheadRules": { class: "WarheadRules", desc: "弹头规则（[Warheads] 段条目：verses 威力表、死亡方式、辐射/心灵/时间等特殊标记）。" },
  "game/rules/ProjectileRules": { class: "ProjectileRules", desc: "弹体规则（[Projectiles] 段条目，继承 ObjectRules：弧线弹道/旋转率/对空对地/隐形弹等）。" },
  "game/rules/SuperWeaponRules": { class: "SuperWeaponRules", desc: "超级武器规则（[SuperWeaponTypes] 段条目：充能时间/侧栏图/挂接武器）。" },
  "game/rules/RadiationRules": { class: "RadiationRules", desc: "辐射规则（辐射场的时长/等级/光效颜色/辐射弹头）。" },
  "game/rules/TiberiumRules": { class: "TiberiumRules", desc: "矿石规则（矿石价值 Value 单键包装）。" },
  "game/rules/AiRules": { class: "AiRules", desc: "AI 建造规则（BuildPower/BuildRefinery/BuildTech 优先表与矿车扫描半径）。" },
  "game/rules/CrateRules": { class: "CrateRules", desc: "箱子规则（生成数量/半径/再生、单位箱类型、贴图与音效）。" },
  "game/rules/ElevationModelRules": { class: "ElevationModelRules", desc: "海拔模型规则（高度格的攻击加成计算：increment/bonus/cap）。" },
  "game/rules/LandRules": { class: "LandRules", desc: "地表规则（每种地表的可建造性与各速度类型的通行系数；entries 遍历段内所有键，凡 SpeedType 名都登记）。" },
  "game/rules/PowerupsRules": { class: "PowerupsRules", desc: "箱子掉落表规则（Powerups 段：类型,概率,动画,数据 逐行解析；未支持类型告警跳过）。" },
  "game/rules/ObjectRulesFactory": { class: "ObjectRulesFactory", desc: "对象规则工厂：按 ObjectType 实例化对应规则类（Techno/Overlay/Terrain/Smudge/Debris/通用）。" },
  "game/rules/CombatDamageRules": { class: "CombatDamageRules", desc: "战斗伤害规则（[CombatDamage] 段：弹头引用、铁幕/力盾时长、伊文炸弹、心灵控制、碉堡/敞开运输车/驻楼武器加成参数）。" },
};

function fail(msg) {
  console.error("FAIL: " + msg);
  process.exit(1);
}

/** 大括号计数提取类体/方法体（from 指向已消费的 "{"，配对到其 "}"）。
 *  只计大括号：类体内部的圆括号总是成对出现，混计会导致深度提前归零。 */
function extractSpan(src, openBraceIndex) {
  let depth = 0;
  let i = openBraceIndex;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { start: openBraceIndex + 1, end: i };
    }
    i++;
  }
  fail("unbalanced span");
}

/** 提取依赖列表与 setter 变量名（顺序一一对应）。 */
function extractDeps(src) {
  const depsLine = /deps:\s*\[([^\]]*)\]/.exec(src);
  if (!depsLine) fail("deps comment not found");
  const deps = depsLine[1].split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
  const setterVars = [];
  const setterRe = /function\s*\(\w*\)\s*\{\s*(\w+)\s*=\s*\w+;?\s*\}/g;
  const block = src.slice(src.indexOf("setters: ["), src.indexOf("execute:"));
  let m;
  while ((m = setterRe.exec(block))) setterVars.push(m[1]);
  if (deps.length !== setterVars.length)
    fail(`deps(${deps.length}) 与 setter 变量(${setterVars.length})数量不一致`);
  return { deps, setterVars };
}

function generate(modName) {
  const meta = DESC[modName];
  if (!meta) fail(`no DESC for ${modName}`);
  const src = readFileSync(join(ROOT, "src", modName + ".ts.js"), "utf8");
  const { deps, setterVars } = extractDeps(src);

  // 类体提取
  const classMarker = /=\s*class\s+(?:extends\s+([\w.]+)\s+)?\{/.exec(src);
  if (!classMarker) fail(`${modName}: class not found`);
  const extendsExpr = classMarker[1] || null;
  const span = extractSpan(src, classMarker.index + classMarker[0].length - 1);
  let body = src.slice(span.start, span.end);

  // 模块压缩变量 → 命名空间导入别名（词边界替换）
  const imports = [];
  for (let i = 0; i < deps.length; i++) {
    const v = setterVars[i];
    const alias = "M" + i + "_" + deps[i].split("/").pop().replace(/[^\w]/g, "");
    const re = new RegExp("\\b" + v + "\\b", "g");
    body = body.replace(re, alias);
    imports.push(`import * as ${alias} from "${deps[i]}";`);
  }

  // 方法参数 e/t → ini（方法体内部词边界改名；签名同步）
  const methodRe = /\b(readIni|parse)\s*\(\s*(\w+)\s*\)\s*\{/g;
  const spans = [];
  let mm;
  while ((mm = methodRe.exec(body))) {
    if (mm[2] === "ini") continue;
    const openBrace = mm.index + mm[0].length - 1;
    const inner = extractSpan(body, openBrace);
    spans.push({ method: mm[1], sigStart: mm.index, bodyStart: openBrace + 1, bodyEnd: inner.end, param: mm[2] });
  }
  for (const s of spans.reverse()) {
    const innerBody = body.slice(s.bodyStart, s.bodyEnd).replace(new RegExp("\\b" + s.param + "\\b", "g"), "ini");
    body =
      body.slice(0, s.sigStart) +
      `${s.method}(ini) {` +
      innerBody +
      body.slice(s.bodyEnd);
  }

  const header = `/**
 * ${meta.class} — ${meta.desc}
 *
 * 由 ${modName}.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
${imports.join("\n")}

/* eslint-disable @typescript-eslint/no-explicit-any */
`;

  // 字段声明：类体内所有 this.X = 赋值的 X 收集为 any 字段
  //（TS 对未声明属性的读写都会报错，即使 strict:false）。
  const fieldNames = [...new Set([...body.matchAll(/this\.(\w+)\s*=/g)].map((m) => m[1]))];
  const fieldBlock = fieldNames.length
    ? "\n" + fieldNames.map((f) => "  " + f + ": any;").join("\n") + "\n"
    : "";

  // extends 子句：模块变量替换为命名空间导入别名
  let renamedExtends = null;
  if (extendsExpr) {
    renamedExtends = extendsExpr;
    for (let i = 0; i < deps.length; i++) {
      renamedExtends = renamedExtends.replace(
        new RegExp("\\b" + setterVars[i] + "\\b", "g"),
        "M" + i + "_" + deps[i].split("/").pop().replace(/[^\w]/g, ""),
      );
    }
  }

  writeFileSync(
    join(ROOT, "src", modName + ".ts"),
    header +
      "\nexport class " +
      meta.class +
      (renamedExtends ? " extends " + renamedExtends : "") +
      " {" +
      fieldBlock +
      body +
      "}\n",
  );
  console.log(`${modName}: generated (${imports.length} imports, ${fieldNames.length} fields, body ${body.length} chars)`);
}

const TARGETS = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DESC);
for (const t of TARGETS) generate(t);
