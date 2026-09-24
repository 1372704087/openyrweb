// 孪生(.ts.js) vs TS(.ts) 变量错位审计（临时脚本）
// 检测签名：
//  A1 构造器参数个数漂移        A2 构造器 this.字段 赋值序列漂移
//  A2b this.x = <参数> 参数下标漂移   A3 方法集/静态性漂移 + 方法参数个数漂移
//  A4 导出名漂移               A5 单例导出形状（孪生 e("X", new X()) vs TS export class X）
//  B1 依赖感知 new 调用漂移（dep, class, argCount 多重集）
//  B2 依赖感知方法接收者漂移（dep.method(argCount) 多重集）
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const findings = [];
const pairs = [];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".ts.js")) out.push(p);
  }
  return out;
}

// 去注释（保留字符串/模板字面量），返回净化文本
function stripComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let mode = "code"; // code | line | block | sq | dq | tpl
  while (i < n) {
    const c = src[i];
    const c2 = src.slice(i, i + 2);
    if (mode === "code") {
      if (c2 === "//") { mode = "line"; i += 2; continue; }
      if (c2 === "/*") { mode = "block"; i += 2; continue; }
      if (c === "'") { mode = "sq"; out += c; i++; continue; }
      if (c === '"') { mode = "dq"; out += c; i++; continue; }
      if (c === "`") { mode = "tpl"; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === "line") { if (c === "\n") { mode = "code"; out += c; } i++; continue; }
    if (mode === "block") { if (c2 === "*/") { mode = "code"; out += " "; i += 2; } else i++; continue; }
    // 字符串/模板
    const quote = mode === "sq" ? "'" : mode === "dq" ? '"' : "`";
    if (c === "\\") { out += src.slice(i, i + 2); i += 2; continue; }
    if (mode === "tpl" && c2 === "${") {
      // 模板插值：找到配对 }，按 code 处理其中内容
      let depth = 1, j = i + 2, inner = "";
      while (j < n && depth > 0) {
        if (src[j] === "{") depth++;
        else if (src[j] === "}") { depth--; if (!depth) break; }
        inner += src[j]; j++;
      }
      out += "${" + stripComments(inner) + "}";
      i = j + 1; continue;
    }
    if (c === quote) { mode = "code"; out += c; i++; continue; }
    out += c; i++;
  }
  return out;
}

// 从 startIdx（指向 '('）起做括号配对，返回 { body, end }（body 不含外层括号）
function matchParen(text, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) return { body: text.slice(startIdx + 1, i), end: i }; }
  }
  return { body: text.slice(startIdx + 1), end: text.length };
}
function matchBrace(text, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return { body: text.slice(startIdx + 1, i), end: i }; }
  }
  return { body: text.slice(startIdx + 1), end: text.length };
}
function stripGenerics(s) {
  // 去掉类型位置的 <...>（参数表里 < 只会是泛型）
  let out = "", depth = 0;
  for (const c of s) {
    if (c === "<") depth++;
    else if (c === ">") { if (depth > 0) depth--; continue; }
    if (depth === 0) out += c;
  }
  return out;
}
function splitTopLevel(s) {
  // 顶层逗号切分（尊重 ()/{}/[] 深度），已先去泛型
  const parts = [];
  let depth = 0, cur = "";
  for (const c of s) {
    if ("([{".includes(c)) { depth++; cur += c; }
    else if (")]}".includes(c)) { depth--; cur += c; }
    else if (c === "," && depth === 0) { parts.push(cur); cur = ""; }
    else cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}
function countParams(paramText) {
  let s = stripGenerics(paramText).trim();
  if (!s) return 0;
  return splitTopLevel(s.replace(/,\s*$/, "")).length;
}
// 类体中的方法列表：name -> { params, isStatic }
const KW = new Set(["if", "for", "while", "switch", "catch", "function", "return", "typeof", "new", "delete", "void", "do", "else", "try", "super", "case"]);
function extractMethods(classBody) {
  const methods = new Map();
  const re = /(^|[\n;})])\s*(static\s+)?(async\s+)?(get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*(\()/g;
  let m;
  while ((m = re.exec(classBody))) {
    const isStatic = !!m[2];
    const kind = (m[4] || "").trim();
    const name = m[5];
    if (KW.has(name) || name === "constructor" || name === "class") continue;
    const { body: paramText } = matchParen(classBody, m[6] === "(" ? re.lastIndex - 1 : m.index + m[0].length - 1);
    const key = (kind ? kind + " " : "") + (isStatic ? "static " : "") + name;
    if (!methods.has(key)) methods.set(key, { params: countParams(paramText), isStatic, kind });
  }
  return methods;
}

function findConstructor(classBody) {
  const re = /(^|[\n;})\s])constructor\s*(\()/g;
  let m;
  while ((m = re.exec(classBody))) {
    const openIdx = classBody.indexOf("(", m.index + m[0].length - 1);
    const { body: params, end } = matchParen(classBody, openIdx);
    // 找构造体 {
    const braceOpen = classBody.indexOf("{", end);
    if (braceOpen === -1) continue;
    const { body } = matchBrace(classBody, braceOpen);
    return { params: countParams(params), body };
  }
  return null;
}

// 孪生：解析 deps 与 setters 字母映射
function parseTwin(src) {
  const depsRe = /System\.register\(\s*"([^"]+)"\s*,\s*\[([\s\S]*?)\]\s*,\s*function\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/;
  const dm = src.match(depsRe);
  const name = dm ? dm[1] : path.basename(src, ".ts.js");
  const deps = dm ? [...dm[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  const exportVar = dm ? dm[3] : "e";
  const depVar = dm ? dm[4] : "t";
  // 模块级字母：var a, b, c;（setters 的目标）
  const varDecl = src.match(/(?:^|\n)\s*var\s+([A-Za-z_$][\w$,\s]*);/);
  const letters = varDecl ? varDecl[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
  // setters: function (e) { X = e; } 顺序与 deps 一致
  const letterToDep = new Map();
  const settersRe = /function\s*\(\s*(\w+)\s*\)\s*\{\s*(\w+)\s*=\s*\1\s*;?\s*\}/g;
  let si = 0, sm;
  while ((sm = settersRe.exec(src))) {
    if (si < deps.length) letterToDep.set(sm[2], deps[si]);
    si++;
  }
  // 导出：e("Name", <valueExpr>)
  const exports = [];
  const expRe = new RegExp(`(?<![\\w$])${exportVar}\\(\\s*"([^"]+)"\\s*,`, "g");
  let em;
  while ((em = expRe.exec(src))) exports.push({ name: em[1], idx: em.index });
  return { name, deps, letters, letterToDep, exports, exportVar };
}

// 孪生类：e("Name", (X = class { ... }))
function extractTwinClasses(src, twin) {
  const classes = [];
  for (const exp of twin.exports) {
    // 从导出名后找 class 关键字（括号配对内）
    const after = src.slice(exp.idx, exp.idx + 400);
    const cm = after.match(/=\s*class\s*\{/) || after.match(/^\s*class\s*\{/) || after.match(/class\s+[A-Za-z_$][\w$]*\s*\{/);
    if (!cm) continue;
    const braceOpen = src.indexOf("{", exp.idx + cm.index + cm[0].length - 1);
    const { body } = matchBrace(src, braceOpen);
    classes.push({ name: exp.name, body });
  }
  return classes;
}

// TS：导出类列表
function extractTsClasses(src) {
  const classes = [];
  const re = /export\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(src))) {
    const braceOpen = src.indexOf("{", m.index + m[0].length - 1);
    const { body } = matchBrace(src, braceOpen);
    classes.push({ name: m[1], body });
  }
  return classes;
}
function extractTsExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:abstract\s+|default\s+)*(?:class|const|function|let|var|enum)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  const brace = src.match(/export\s*\{([^}]*)\}/);
  if (brace) for (const part of brace[1].split(",")) {
    const nm = part.trim().split(/\s+as\s+/).pop().trim();
    if (nm) names.add(nm);
  }
  return names;
}

// 依赖感知调用收集：twin 用字母映射，TS 用 import 绑定映射
// 数实参个数（容忍尾逗号，尊重嵌套深度）
function countArgs(body) {
  const s = body.trim().replace(/,\s*$/, "");
  if (!s) return 0;
  return splitTopLevel(s).length;
}
function collectNewCalls(text, resolve) {
  // new X.Y(...) / new X(...)
  const out = [];
  const re = /new\s+([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*(?=\()/g;
  let m;
  while ((m = re.exec(text))) {
    const openIdx = text.indexOf("(", re.lastIndex - 1);
    const { body } = matchParen(text, openIdx);
    const resolved = resolve(m[1]);
    if (resolved) out.push(`${resolved}#${countArgs(body)}`);
  }
  return out;
}
function collectMethodCalls(text, resolve) {
  // 接收者可带 ns.Class 前缀链：先试解析"除最后段外的完整前缀"（静态链 f.Coords），退化为首段
  const out = [];
  const re = /((?:[A-Za-z_$][\w$]*\.)+)([A-Za-z_$][\w$]*)\s*(?=\()/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 6), m.index);
    if (/new\s+$/.test(before)) continue; // new X.Y(...) 已由 B1 统计，避免双计
    const parts = (m[1] + m[2]).split(".");
    const recv = parts.slice(0, -1).join(".");
    const meth = parts[parts.length - 1];
    const openIdx = text.indexOf("(", re.lastIndex - 1);
    const { body } = matchParen(text, openIdx);
    let resolved = resolve(recv);
    if (!resolved && recv.includes(".")) resolved = resolve(recv.split(".")[0]); // 首段命名空间兜底
    if (resolved) out.push(`${resolved.replace(/::[^.]+$/, "::*")}.${meth}#${countArgs(body)}`); // B2 类段归一化（孪生压缩名无法对齐类名）
  }
  return out;
}
function multisetDiff(a, b) {
  const cnt = new Map();
  for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1);
  for (const x of b) cnt.set(x, (cnt.get(x) || 0) - 1);
  const onlyA = [], onlyB = [];
  for (const [k, v] of cnt) { if (v > 0) onlyA.push(`${k} x${v}`); if (v < 0) onlyB.push(`${k} x${-v}`); }
  return { onlyA, onlyB };
}
function diff(aArr, bArr) { return multisetDiff(aArr, bArr); }

function report(mod, tag, msg) {
  findings.push({ mod, tag, msg });
}

const b1Twin = new Map(), b1Ts = new Map(), b2Twin = new Map(), b2Ts = new Map();

for (const twinPath of walk(SRC)) {
  const tsPath = twinPath.replace(/\.ts\.js$/, ".ts");
  if (!fs.existsSync(tsPath)) { report(twinPath, "MISSING-TS", "无对应 .ts"); continue; }
  pairs.push(twinPath);
  const twinRaw = fs.readFileSync(twinPath, "utf8");
  const tsRaw = fs.readFileSync(tsPath, "utf8");
  const twin = stripComments(twinRaw);
  const ts = stripComments(tsRaw);
  const mod = path.relative(SRC, twinPath).replace(/\.ts\.js$/, "");
  const tinfo = parseTwin(twin);

  // TS import 绑定: 本地名 -> { dep, isNs }
  const tsImports = new Map();
  for (const m of ts.matchAll(/import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g)) tsImports.set(m[1], { dep: m[2], isNs: true });
  for (const m of ts.matchAll(/import\s*\{\s*([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?\s*(?:,\s*[A-Za-z_$][\w$]*(?:\s+as\s+[A-Za-z_$][\w$]*)?\s*)*\}\s*from\s+["']([^"']+)["']/g)) {
    for (const nm of m[0].slice(m[0].indexOf("{") + 1, m[0].indexOf("}")).split(",")) {
      const [orig, alias] = nm.trim().split(/\s+as\s+/);
      if (orig) tsImports.set((alias || orig).trim(), { dep: m[2], isNs: false });
    }
  }
  for (const m of ts.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g)) tsImports.set(m[1], { dep: m[2], isNs: false });
  // 相对路径归一化成模块名（孪生用全注册名，TS 用 ./ ../ 相对路径）
  const normDep = (dep) => {
    if (!dep.startsWith(".")) return dep;
    return path.posix.normalize(path.posix.join(path.posix.dirname(mod.split(path.sep).join("/")), dep)).replace(/^\.\//, "").replace(/\.js$/, "");
  };
  for (const [k, v] of tsImports) v.dep = normDep(v.dep);
  // 本地别名: const X: any = Ns.Y / (Ns as any).Y / Ns.default / ... as any —— 整模块别名模式（0c6f44d）
  for (const m of ts.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;\n]+)?=\s*\(?\s*([A-Za-z_$][\w$]*)\s*(?:as\s+any\s*\)?)?\s*\)?\s*\.\s*(?:default\.)?([A-Za-z_$][\w$]*)\s*(?:as\s+any)?\s*[;\n]/g)) {
    const nsInfo = tsImports.get(m[2]);
    if (nsInfo && !tsImports.has(m[1])) tsImports.set(m[1], { dep: nsInfo.dep, isNs: false, cls: m[3] });
  }

  // 解析器：twin 字母 -> dep 路径（字母必须出现在模块级 var 列表）
  const twinResolve = (tok) => {
    if (tok.includes(".")) {
      const [ns, cls] = tok.split(".");
      const dep = tinfo.letterToDep.get(ns);
      if (dep && tinfo.letters.includes(ns)) return `${dep}::${cls}`;
      return null;
    }
    const dep = tinfo.letterToDep.get(tok);
    return dep && tinfo.letters.includes(tok) ? `${dep}::*` : null;
  };
  const tsResolve = (tok) => {
    if (tok.includes(".")) {
      const [ns, cls] = tok.split(".");
      const info = tsImports.get(ns);
      if (info) return `${info.dep}::${cls}`;
      return null;
    }
    const info = tsImports.get(tok);
    if (!info) return null;
    if (info.cls) return `${info.dep}::${info.cls}`;
    // 命名/默认导入绑定名即类名；namespace 整体标 *（与孪生 dep::X 不匹配→正是要抓的整命名空间误用）
    return info.isNs ? `${info.dep}::*` : `${info.dep}::${tok}`;
  };

  // ---- A1/A2/A2b/A3: 逐导出类比对 ----
  const twinClasses = extractTwinClasses(twin, tinfo);
  const tsClasses = extractTsClasses(ts);
  const tsClassMap = new Map(tsClasses.map((c) => [c.name, c]));
  for (const tc of twinClasses) {
    const sc = tsClassMap.get(tc.name);
    if (!sc) { report(mod, "A0-CLASS-MISSING", `孪生导出类 ${tc.name} 在 TS 无同名 export class（可能是单例/改名）`); continue; }
    const twCtor = findConstructor(tc.body);
    const tsCtor = findConstructor(sc.body);
    if (twCtor && !tsCtor) {
      // 孪生 0 参构造器若只含 super(...) 调用，TS 省略构造器等价（自动 super()）——但 super 带参不等价
      const stripped = twCtor.body.replace(/super\s*\([^)]*\)\s*;?/g, "").replace(/\s+/g, "");
      if (twCtor.params > 0 || stripped)
        report(mod, "A1-CTOR", `${tc.name}: 孪生有构造器(${twCtor.params}参${stripped ? ",体非空" : ""}) TS 无${twCtor.params === 0 && !stripped ? "（super带参? 需查）" : ""}`);
    }
    if (!twCtor && tsCtor) report(mod, "A1-CTOR", `${tc.name}: TS 有构造器(${tsCtor.params}参) 孪生无`);
    if (twCtor && tsCtor) {
      if (twCtor.params !== tsCtor.params)
        report(mod, "A1-CTOR", `${tc.name}: 构造器参数个数 孪生=${twCtor.params} TS=${tsCtor.params}`);
      // A2: this.字段 赋值序列
      const twFields = [...twCtor.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)].map((m) => m[1]);
      const tsFields = [...tsCtor.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)].map((m) => m[1]);
      if (twFields.join(",") !== tsFields.join(","))
      {
        const setTwin = [...new Set(twFields)].sort().join(",");
        const setTs = [...new Set(tsFields)].sort().join(",");
        const kind = setTwin === setTs ? "纯顺序差" : "字段集合不同";
        report(mod, "A2-FIELDSEQ", `${tc.name}: 构造器字段赋值序列不一致（${kind}）\n    孪生: ${twFields.join(", ")}\n    TS:   ${tsFields.join(", ")}`);
      }
      // A2b: this.x = <裸参数> 的参数下标
      const twParamNames = twCtor.params > 0 ? [] : [];
      const twAssigns = [...twCtor.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*[,;)]/g)]
        .map((m) => [m[1], m[2]]);
      const tsAssigns = [...tsCtor.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*[,;)]/g)]
        .map((m) => [m[1], m[2]]);
      if (twAssigns.length === tsAssigns.length && twAssigns.length > 0) {
        // 参数下标按参数表位置：两侧都重新解析参数名序列
        const twCtorSrc = tc.body.match(/constructor\s*\(/);
        const twOpen = twCtorSrc ? tc.body.indexOf("(", twCtorSrc.index) : -1;
        const twParamList = twOpen >= 0 ? splitTopLevel(stripGenerics(matchParen(tc.body, twOpen).body)).map((s) => s.trim().split(/[=:]/)[0].replace(/[?]/g, "").trim()).filter(Boolean) : [];
        const tsCtorSrc = sc.body.match(/constructor\s*\(/);
        const tsOpen = tsCtorSrc ? sc.body.indexOf("(", tsCtorSrc.index) : -1;
        const tsParamList = tsOpen >= 0 ? splitTopLevel(stripGenerics(matchParen(sc.body, tsOpen).body)).map((s) => s.trim().split(/[=:]/)[0].replace(/[?]/g, "").trim()).filter(Boolean) : [];
        for (let i = 0; i < twAssigns.length; i++) {
          const [f, pv] = twAssigns[i];
          const idx = twParamList.indexOf(pv);
          const [f2, pv2] = tsAssigns[i];
          const tsIdx = tsParamList.indexOf(pv2);
          if (f === f2 && idx !== -1 && tsIdx !== -1 && idx !== tsIdx)
            report(mod, "A2b-PARAMIDX", `${tc.name}: this.${f} 孪生绑到第 ${idx} 参(${pv})，TS 绑到第 ${tsIdx} 参(${pv2})`);
        }
      }
    }
    // A3: 方法集 + 参数个数
    const twMethods = extractMethods(tc.body);
    const tsMethods = extractMethods(sc.body);
    for (const [key, info] of twMethods) {
      const tsInfo = tsMethods.get(key);
      if (!tsInfo) {
        if (!tsMethods.has(key.replace(/^static /, ""))) {
          const bare = key.replace(/^static /, "").replace(/^(get|set) /, "");
          const foundElsewhere = new RegExp(`\\b${bare.replace(/\$/g, "\\$")}\\b`).test(ts) || new RegExp(`["']${bare}["']`).test(ts);
          report(mod, foundElsewhere ? "A3-METHOD" : "A3-ABSENT", `${tc.name}: 孪生方法 ${key}(${info.params}) ${foundElsewhere ? "TS 类中缺失（名字在文件其他位置出现，可能搬为模块函数）" : "在整个 TS 文件中消失"}`);
        }
        continue;
      }
      if (info.params !== tsInfo.params) report(mod, "A3-METHOD", `${tc.name}: 方法 ${key} 参数个数 孪生=${info.params} TS=${tsInfo.params}`);
    }
    for (const key of tsMethods.keys())
      if (!twMethods.has(key)) report(mod, "A3-METHOD-EXTRA", `${tc.name}: TS 多出方法 ${key}（孪生无同名）`);
  }
  for (const sc of tsClasses)
    if (!twinClasses.some((tc) => tc.name === sc.name) && twinClasses.length > 0)
      report(mod, "A0-CLASS-EXTRA", `TS 导出类 ${sc.name} 在孪生无同名导出类`);

  // ---- A4/A5: 导出名与形状 ----
  const tsExportNames = extractTsExports(ts);
  for (const exp of tinfo.exports) {
    if (!tsExportNames.has(exp.name)) report(mod, "A4-EXPORT", `孪生导出 "${exp.name}" 在 TS 导出中缺失`);
  }
  // A5 单例：孪生 e("X", new ...)
  for (const exp of tinfo.exports) {
    const after = twin.slice(exp.idx, exp.idx + 300);
    if (/^\s*\(\s*[A-Za-z_$][\w$]*\s*=\s*class/.test(after.slice(exp.name.length + 4)) || /=\s*class/.test(after)) continue;
    if (/e\(\s*"[^"]+"\s*,\s*new\s/.test(after)) {
      if (!new RegExp(`export\\s+const\\s+${exp.name}\\s*=\\s*new\\s`).test(ts))
        report(mod, "A5-SINGLETON", `孪生 "${exp.name}" 导出的是 new 实例，TS 未用 export const ${exp.name} = new ...`);
    }
  }

  // ---- B1/B2: 依赖感知调用比对（全模块文本）----
  const twNew = collectNewCalls(twin, twinResolve);
  const tsNew = collectNewCalls(ts, tsResolve);
  const dNew = diff(twNew, tsNew);
  for (const s of dNew.onlyA) b1Twin.set(s, (b1Twin.get(s) || 0) + 1);
  for (const s of dNew.onlyB) b1Ts.set(s, (b1Ts.get(s) || 0) + 1);
  if (dNew.onlyA.length || dNew.onlyB.length) {
    const fmt = (arr) => arr.slice(0, 6).join("; ") + (arr.length > 6 ? ` (+${arr.length - 6})` : "");
    report(mod, "B1-NEW", `new 调用漂移 — 仅孪生: ${fmt(dNew.onlyA) || "无"} | 仅TS: ${fmt(dNew.onlyB) || "无"}`);
  }
  const twCalls = collectMethodCalls(twin, twinResolve);
  const tsCalls = collectMethodCalls(ts, tsResolve);
  const dCalls = diff(twCalls, tsCalls);
  for (const s of dCalls.onlyA) b2Twin.set(s, (b2Twin.get(s) || 0) + 1);
  for (const s of dCalls.onlyB) b2Ts.set(s, (b2Ts.get(s) || 0) + 1);
  if (dCalls.onlyA.length || dCalls.onlyB.length) {
    const fmt = (arr) => arr.slice(0, 6).join("; ") + (arr.length > 6 ? ` (+${arr.length - 6})` : "");
    report(mod, "B2-CALL", `依赖方法调用漂移 — 仅孪生: ${fmt(dCalls.onlyA) || "无"} | 仅TS: ${fmt(dCalls.onlyB) || "无"}`);
  }
}

// 汇总
const byTag = {};
for (const f of findings) (byTag[f.tag] ||= []).push(f);
console.log(`扫描孪生/TS 对: ${pairs.length}`);
console.log(`发现总数: ${findings.length}`);
for (const [tag, list] of Object.entries(byTag).sort((a, b) => b[1].length - a[1].length))
  console.log(`  ${tag}: ${list.length}`);
const topSig = (m, title) => {
  const arr = [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${title}（签名: 跨模块出现次数，TOP25）`);
  for (const [k, v] of arr.slice(0, 25)) console.log(`  ${v}\t${k}`);
  console.log(`  …共 ${arr.length} 种签名`);
};
topSig(b1Twin, "B1 仅孪生有");
topSig(b1Ts, "B1 仅TS有");
topSig(b2Twin, "B2 仅孪生有");
topSig(b2Ts, "B2 仅TS有");
console.log("\n=== 明细 ===");
const priority = ["A3-ABSENT", "A1-CTOR", "A2-FIELDSEQ", "A2b-PARAMIDX", "A3-METHOD", "A0-CLASS-MISSING", "A5-SINGLETON", "A4-EXPORT", "B1-NEW", "B2-CALL", "A0-CLASS-EXTRA", "A3-METHOD-EXTRA"];
for (const tag of priority) {
  for (const f of byTag[tag] || []) console.log(`[${f.tag}] ${f.mod}: ${f.msg}`);
}
