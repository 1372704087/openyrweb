/**
 * tests/alias-shadow-audit.mjs — Static audit for shadowed module aliases in the
 * reconstructed SystemJS twins (src/<name>.ts.js).
 *
 * WHY: these twins were rebuilt from a minified bundle, so each module's dependency
 * namespaces live in single-letter `var`s at the top of the register factory
 * (e.g. `var n, o, k, i, r, l, c, h, ...;`). If a method parameter or local variable
 * reuses one of those letters it silently shadows the namespace. A body that then
 * reads `X.SomeMember` reads the local instead — throwing
 * `TypeError: Cannot read properties of undefined (reading 'SomeMember')`, or worse,
 * producing a plausible wrong value.
 *
 * Example found by this audit (src/game/Warhead.ts.js, fixed in 1e48391):
 *   inflictDamage(e, t, i, r, s = !1) { ... s.ObjectType.Infantry ... }
 * The 5th parameter was named `s` while `s` is also the alias of
 * engine/type/ObjectType (dep #14), so the read hit the boolean parameter.
 * The original text used `j.ObjectType` instead — `j` is RadialTileFinder, so that
 * spelling was equally broken; renaming the parameter is the only self-consistent fix.
 *
 * HOW: real scope resolution with the TypeScript parser. Regex heuristics are useless
 * here (they yield ~20k flagged sites on this codebase). Three steps:
 *   1. find `NAME.UpperCaseMember` reads where NAME is a module alias declared at the
 *      register factory top level AND is shadowed by an inner parameter/variable;
 *   2. map NAME back to its dependency via the `var` declaration order vs the
 *      `System.register(name, deps, factory)` deps array;
 *   3. confirm it as REAL only when that dependency actually exports the member.
 *      Export statements invoke the register factory's FIRST parameter, whose name
 *      differs per module (`t("Name", ...)`, `e("Name", ...)`, ...) — never hard-code one.
 *
 * LIMITATION: when the rebuild picked a completely wrong alias, that alias's dependency
 * does not export the member either, so step 3 cannot confirm it. Those cases still
 * need a human look at the `--suspects` list.
 *
 * Run: node tests/alias-shadow-audit.mjs [--suspects] [files...]
 * Exit code: 0 when nothing is confirmed, 1 when at least one site is confirmed.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const SHOW_SUSPECTS = process.argv.includes("--suspects");

// `var` has neither the Let nor the Const bit in declarationList.flags
// (let = +1, const = +2). Note: ts.NodeFlags.Var does not exist.
const isVarDecl = (flags) => !(flags & (ts.NodeFlags.Let | ts.NodeFlags.Const));
const isLetOrConst = (flags) => !!(flags & (ts.NodeFlags.Let | ts.NodeFlags.Const));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".ts.js")) out.push(p);
  }
  return out;
}

const exportCache = new Map();
/** Does module `dep` export `prop`? (export statements call the factory's 1st param) */
function exportsName(dep, prop) {
  let set = exportCache.get(dep);
  if (!set) {
    set = new Set();
    for (const rel of ["src/" + dep + ".ts.js", "build/ts-modules/" + dep + ".js"]) {
      const p = path.join(ROOT, rel);
      if (!fs.existsSync(p)) continue;
      const code = fs.readFileSync(p, "utf8");
      for (const m of code.matchAll(/(?:^|[^\w$])[A-Za-z_$][\w$]*\(\s*"([A-Za-z_$][\w$]*)"/g)) set.add(m[1]);
      if (set.size) break;
    }
    exportCache.set(dep, set);
  }
  return set.has(prop);
}

function findRegisterCall(sf) {
  let call = null;
  const visit = (node) => {
    if (
      !call &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "register" &&
      node.arguments.length >= 2
    )
      call = node;
    if (!call) ts.forEachChild(node, visit);
  };
  visit(sf);
  return call;
}

/** Collect every `var` name inside a node, without descending into nested functions. */
function collectVars(node, set) {
  if (!node) return;
  if (ts.isFunctionLike(node)) return;
  if (ts.isVariableStatement(node) && isVarDecl(node.declarationList.flags))
    for (const d of node.declarationList.declarations)
      if (ts.isIdentifier(d.name)) set.add(d.name.text);
  ts.forEachChild(node, (c) => collectVars(c, set));
}

function fnScopeOf(node) {
  const s = new Set();
  for (const p of node.parameters || []) {
    if (ts.isIdentifier(p.name)) s.add(p.name.text);
    else
      ts.forEachChild(p.name, function collect(n) {
        if (ts.isIdentifier(n)) s.add(n.text);
        ts.forEachChild(n, collect);
      });
  }
  if (node.name && ts.isIdentifier(node.name)) s.add(node.name.text);
  if (node.body) collectVars(node.body, s);
  return s;
}

/** Block scope holds only let/const/class/function; `var` belongs to the function scope. */
function blockScopeOf(stmts) {
  const s = new Set();
  for (const stmt of stmts) {
    if (ts.isVariableStatement(stmt) && isLetOrConst(stmt.declarationList.flags))
      for (const d of stmt.declarationList.declarations)
        if (ts.isIdentifier(d.name)) s.add(d.name.text);
    if ((ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) && stmt.name) s.add(stmt.name.text);
  }
  return s;
}

function analyze(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("System.register")) return [];
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const call = findRegisterCall(sf);
  if (!call) return [];

  const depsArg = call.arguments[1];
  const deps = ts.isArrayLiteralExpression(depsArg) ? depsArg.elements.map((e) => e.text) : [];
  const factory = call.arguments[call.arguments.length - 1];
  if (!factory.body) return [];

  let varStmt = null;
  for (const stmt of factory.body.statements)
    if (ts.isVariableStatement(stmt) && isVarDecl(stmt.declarationList.flags)) {
      varStmt = stmt;
      break;
    }
  const aliasOrder = varStmt ? varStmt.declarationList.declarations.map((d) => d.name.text) : [];
  const aliases = new Set(aliasOrder);
  if (!aliases.size) return [];
  const depOf = (name) => deps[aliasOrder.indexOf(name)];

  const hits = [];
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const scopes = [];
  const resolveDepth = (name) => {
    for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return i;
    return -1;
  };

  const traverse = (node) => {
    if (ts.isFunctionLike(node)) {
      scopes.push(fnScopeOf(node));
      if (node.body) {
        if (ts.isBlock(node.body)) {
          scopes.push(blockScopeOf(node.body.statements));
          for (const s of node.body.statements) traverse(s);
          scopes.pop();
        } else traverse(node.body);
      }
      scopes.pop();
      return;
    }
    if (ts.isBlock(node)) {
      scopes.push(blockScopeOf(node.statements));
      for (const s of node.statements) traverse(s);
      scopes.pop();
      return;
    }
    if (ts.isPropertyAccessExpression(node)) {
      const obj = node.expression;
      const prop = node.name.text;
      if (ts.isIdentifier(obj) && aliases.has(obj.text) && /^[A-Z]/.test(prop)) {
        // depth 0 = the register factory's own alias (fine); > 0 = shadowed by an inner binding
        if (resolveDepth(obj.text) > 0) {
          const dep = depOf(obj.text);
          hits.push({ line: lineOf(obj), name: obj.text, prop, dep, real: !!dep && exportsName(dep, prop) });
        }
      }
    }
    ts.forEachChild(node, traverse);
  };

  scopes.push(fnScopeOf(factory));
  for (const s of factory.body.statements) traverse(s);
  scopes.pop();
  return hits;
}

const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const targets = files.length ? files : walk(SRC);
if (targets.length === 0) {
  // 该审计针对孪生的单字母别名结构；孪生全部删除后无扫描对象，按迁移终态跳过（exit 0）。
  console.log("=== alias-shadow audit: no src/**/*.ts.js on disk (migration end state) — skipped ===");
  process.exit(0);
}

let confirmed = 0;
let suspectFiles = 0;
for (const f of targets) {
  const hits = analyze(f);
  if (!hits.length) continue;
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const real = hits.filter((h) => h.real);
  const suspects = hits.filter((h) => !h.real);
  const seen = new Set();

  if (real.length) {
    console.log(`\nFAIL ${rel}`);
    for (const h of real) {
      const k = `${h.line}:${h.name}.${h.prop}`;
      if (seen.has(k)) continue;
      seen.add(k);
      confirmed++;
      console.log(`   L${h.line}  ${h.name}.${h.prop}  —  ${h.name} is the alias of ${h.dep},`);
      console.log(`              but ${h.name} is shadowed by a parameter/local in this scope`);
    }
  }
  if (SHOW_SUSPECTS && suspects.length) {
    suspectFiles++;
    console.log(`\n? ${rel}  (${suspects.length} shadowed-alias read(s) whose dependency does not export the member)`);
    const s2 = new Set();
    for (const h of suspects) {
      const k = `${h.line}:${h.name}.${h.prop}`;
      if (s2.has(k)) continue;
      s2.add(k);
      console.log(`   L${h.line}  ${h.name}.${h.prop}   (${h.name} → ${h.dep ?? "(no dep)"})`);
    }
  }
}

console.log(
  `\n=== alias-shadow audit: scanned ${targets.length} twin file(s), ` +
    `${confirmed} confirmed hit(s)${SHOW_SUSPECTS ? `, ${suspectFiles} file(s) with suspects` : ""} ===`,
);
if (confirmed > 0) {
  console.log("A confirmed hit means a module namespace read is shadowed by a local binding.");
  console.log("Fix by renaming the parameter/local to match the TS source (see 1e48391).");
}
process.exit(confirmed > 0 ? 1 : 0);
