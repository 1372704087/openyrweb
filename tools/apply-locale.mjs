#!/usr/bin/env node
/**
 * tools/apply-locale.mjs — merge build.mjs core locale tables + extension
 * manifests into build/res/locale/{en-US,zh-CN,zh-TW}.json without a full rebuild.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_LOCALE = join(ROOT, "build", "res", "locale");
const VENDOR_LOCALE = join(ROOT, "vendor", "res", "locale");
const EXTENSION_DIR = join(ROOT, "src", "extensions");
const BUILD_MJS = join(ROOT, "tools", "build.mjs");

// Extract EN_LOCALE / ZH_CN_LOCALE / ZH_TW_LOCALE object literals from build.mjs
function extractLocaleTable(source, name) {
  const start = source.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`Cannot find ${name}`);
  let i = source.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let j = i; j < source.length; j++) {
    const c = source[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        end = j;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`Unbalanced braces for ${name}`);
  const literal = source.slice(i, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal})`)();
}

function collectExtensionMessages() {
  const perLang = {};
  if (!existsSync(EXTENSION_DIR)) return perLang;
  for (const id of readdirSync(EXTENSION_DIR)) {
    const p = join(EXTENSION_DIR, id, "extension.manifest.json");
    if (!existsSync(p)) continue;
    const m = JSON.parse(readFileSync(p, "utf8"));
    for (const [lang, msgs] of Object.entries(m.messages || {})) {
      perLang[lang] = perLang[lang] || {};
      for (const [k, v] of Object.entries(msgs)) {
        if (typeof v === "string") perLang[lang][k] = v;
      }
    }
  }
  return perLang;
}

const buildSrc = readFileSync(BUILD_MJS, "utf8");
const tables = {
  "en-US.json": extractLocaleTable(buildSrc, "EN_LOCALE"),
  "zh-CN.json": extractLocaleTable(buildSrc, "ZH_CN_LOCALE"),
  "zh-TW.json": extractLocaleTable(buildSrc, "ZH_TW_LOCALE"),
};
const ext = collectExtensionMessages();
const langOf = { "en-US.json": "en-US", "zh-CN.json": "zh-CN", "zh-TW.json": "zh-TW" };

if (!existsSync(BUILD_LOCALE)) mkdirSync(BUILD_LOCALE, { recursive: true });

for (const file of Object.keys(tables)) {
  const vendorPath = join(VENDOR_LOCALE, file);
  const buildPath = join(BUILD_LOCALE, file);
  const base = existsSync(buildPath)
    ? JSON.parse(readFileSync(buildPath, "utf8"))
    : JSON.parse(readFileSync(vendorPath, "utf8"));
  let n = 0;
  for (const [k, v] of Object.entries(tables[file])) {
    base[k] = v;
    n++;
  }
  const lang = langOf[file];
  const extTable = ext[lang] || {};
  for (const [k, v] of Object.entries(extTable)) {
    base[k] = v;
    n++;
  }
  writeFileSync(buildPath, JSON.stringify(base, null, 4));
  console.log(`${file}: +${n} keys → ${buildPath}`);
}

// Report keys the user has hit (error dialog + prior boot fixes)
const CHECK_KEYS = [
  "GUI:Campaign",
  "TS:MultiLobbyTip",
  "STT:SinglePlayer",
  "GUI:CopyDetails",
  "GUI:DownloadLog",
  "GUI:ErrorDetails",
  "GUI:Copied",
  "GUI:MapTransfer",
  "GUI:HostMapTransfer",
  "GUI:JoinerMapTransfer",
];
for (const file of Object.keys(tables)) {
  const j = JSON.parse(readFileSync(join(BUILD_LOCALE, file), "utf8"));
  const lower = new Set(Object.keys(j).map((k) => k.toLowerCase()));
  for (const k of CHECK_KEYS) {
    const hit = j[k] !== undefined || lower.has(k.toLowerCase());
    console.log(`  ${file} ${k}: ${hit ? "OK" : "MISSING"}`);
  }
}
