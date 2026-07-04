﻿import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(__dirname, "build", "lib", "system.js"), "utf8");

// Count i("normalize" calls by scanning the code character by character
// Since the file is one line, we need to be careful
let idx = 0;
let normalizeCalls = [];
let decanonicalizeCalls = [];
let assignIdx = -1;

while (idx < code.length) {
  // Look for `i("normalize"`
  const nIdx = code.indexOf('i("normalize"', idx);
  if (nIdx !== -1) {
    normalizeCalls.push(nIdx);
    idx = nIdx + 1;
  }
  
  const dIdx = code.indexOf('i("decanonicalize"', idx === 0 ? 0 : idx);
  // Actually, let me use a different approach
  break;
}

// Simpler approach: find all occurrences using regex
const normalizeMatches = [...code.matchAll(/i\("normalize"/g)].map(m => m.index);
const decanonicalizeMatches = [...code.matchAll(/i\("decanonicalize"/g)].map(m => m.index);
const assignMatch = code.search(/\.normalizeSync\s*=\s*\.decanonicalize|normalizeSync\s*=\s*a\.prototype\.decanonicalize|normalizeSync\s*=\s*decanonicalize/);

// Also search for the actual normalize function call inside register
const registerNormalize = code.match(/\.register\s*=\s*function[^}]+decanonicalize[^}]+normalize/);
if (registerNormalize) {
  console.log("Register function found. Check above.");
}

console.log(`All i("normalize") positions:`, normalizeMatches.map(n => `${n}(${code.substring(n, n+50)})`));
console.log(`\nAll i("decanonicalize") positions:`, decanonicalizeMatches.map(n => `${n}(${code.substring(n, n+50)})`));
console.log(`\nAssignment near: ${assignMatch}`);

const normBeforeAssign = normalizeMatches.filter(n => n < assignMatch).length;
const normAfterAssign = normalizeMatches.filter(n => n > assignMatch).length;
console.log(`i("normalize") BEFORE assignment: ${normBeforeAssign}`);
console.log(`i("normalize") AFTER assignment: ${normAfterAssign}`);

// Look for what the first normalize override does
console.log(`\nFirst i("normalize") at ${normalizeMatches[0]}:`);
const firstNormEnd = code.indexOf("})", normalizeMatches[0]);
console.log(code.substring(normalizeMatches[0], firstNormEnd + 2));

console.log(`\nContext around assignment (${assignMatch}):`);
console.log(code.substring(Math.max(0, assignMatch - 30), assignMatch + 80));
