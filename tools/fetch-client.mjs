#!/usr/bin/env node
/**
 * fetch-client.mjs — Downloader for the Chrono Divide web client (game.chronodivide.com).
 *
 * Purpose (project context): establish a self-hostable, offline-capable copy of the
 * web client so that single-player / skirmish / replay run with zero dependency on the
 * official servers. This is the A0 asset-acquisition step of the reverse-engineering plan.
 *
 * Implementation note: Cloudflare fingerprints TLS/User-Agent. Node's global `fetch`
 * (undici) is detected and returns 403 even with browser headers, while `curl` with a
 * realistic UA succeeds (verified 2026-06-27). We therefore shell out to curl per file.
 *
 * Usage:
 *   node tools/fetch-client.mjs                 # fetch everything into ./client
 *   node tools/fetch-client.mjs --list          # print manifest only, no download
 *   BASE_URL=... node tools/fetch-client.mjs    # override origin
 *
 * Output: ./client/  mirroring the site's path layout (index.html, dist/, lib/, res/, style.css).
 */

import { createHash } from "node:crypto";
import { createWriteStream, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = join(ROOT, "client");

const BASE_URL = process.env.BASE_URL || "https://game.chronodivide.com";
const LIST_ONLY = process.argv.includes("--list");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// Per-resource Accept + Sec-Fetch hints; default to script context.
function curlHeaderArgs(dest) {
  const common = [
    "-A", UA,
    "-H", "Accept-Language: en-US,en;q=0.9",
    "-H", "Accept-Encoding: identity",
    "-H", `Referer: ${BASE_URL}/`,
  ];
  switch (dest) {
    case "document":
      return [
        ...common,
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "-H", "Sec-Fetch-Dest: document",
        "-H", "Sec-Fetch-Mode: navigate",
        "-H", "Sec-Fetch-Site: none",
        "-H", "Upgrade-Insecure-Requests: 1",
      ];
    case "style":
      return [
        ...common,
        "-H", "Accept: text/css,*/*;q=0.1",
        "-H", "Sec-Fetch-Dest: style",
        "-H", "Sec-Fetch-Mode: no-cors",
        "-H", "Sec-Fetch-Site: same-origin",
      ];
    default: // script
      return [
        ...common,
        "-H", "Accept: */*",
        "-H", "Sec-Fetch-Dest: script",
        "-H", "Sec-Fetch-Mode: no-cors",
        "-H", "Sec-Fetch-Site: same-origin",
      ];
  }
}

/**
 * Manifest: every path (relative to site root) to fetch.
 * `dest` chooses fetch headers; `optional` means a 404 is not fatal.
 */
const MANIFEST = [
  // HTML entry
  { path: "index.html", dest: "document" },

  // Main app bundles (SystemJS register format) + vendor chunk
  { path: "dist/ra2web.min.js?v=0.82.0-0", dest: "script", saveAs: "dist/ra2web.min.js" },
  { path: "dist/vendor.bundle.min.js?v=0.82.0-0", dest: "script", saveAs: "dist/vendor.bundle.min.js" },
  { path: "dist/spbots.min.js?v=0.82.0-0", dest: "script", saveAs: "dist/spbots.min.js" },
  { path: "dist/worker.min.js?v=0.82.0", dest: "script", saveAs: "dist/worker.min.js" },
  { path: "dist/7zz.js", dest: "script", saveAs: "dist/7zz.js" },
  { path: "dist/7zz.wasm", dest: "script", saveAs: "dist/7zz.wasm" }, // 7-Zip WASM binary (companion to 7zz.js)
  { path: "dist/ffmpeg.min.js", dest: "script", saveAs: "dist/ffmpeg.min.js" },
  { path: "dist/web-audio-polyfill.min.js?v=2", dest: "script", saveAs: "dist/web-audio-polyfill.min.js" },

  // Source maps — optional, likely 404 but worth trying
  { path: "dist/ra2web.min.js.map", dest: "script", saveAs: "dist/ra2web.min.js.map", optional: true },
  { path: "dist/vendor.bundle.min.js.map", dest: "script", saveAs: "dist/vendor.bundle.min.js.map", optional: true },

  // Vendor / engine libraries
  { path: "lib/system.js", dest: "script" },
  { path: "lib/three.min.js?v0.94", dest: "script", saveAs: "lib/three.min.js" },
  { path: "lib/three/three.shader-patch.js?v=2", dest: "script", saveAs: "lib/three/three.shader-patch.js" },
  { path: "lib/three/three.octree.js?v=2", dest: "script", saveAs: "lib/three/three.octree.js" },
  { path: "lib/three/SimplexNoise.js", dest: "script" },
  { path: "lib/three/LightningStrike.js", dest: "script" },
  { path: "lib/three/TrailRenderer.js", dest: "script" },
  { path: "lib/three/SPE.min.js", dest: "script" },
  { path: "lib/three/SPE.patch.js", dest: "script" },
  { path: "lib/growingpacker.js", dest: "script" },
  { path: "lib/lzo1x.js", dest: "script" },
  { path: "lib/fullscreen-api-polyfill.min.js", dest: "script" },
  { path: "lib/poll.js?v=2", dest: "script", saveAs: "lib/poll.js" },

  // FFmpeg WASM core — loaded by dist/ffmpeg.min.js during game-resource import
  // (corePath hardcoded to "lib/ffmpeg-core.js?v=1" in GameResImporter.ts.js:407;
  // ffmpeg derives .wasm and .worker.js from it). worker.js is 0 bytes on origin.
  { path: "lib/ffmpeg-core.js?v=1", dest: "script", saveAs: "lib/ffmpeg-core.js" },
  { path: "lib/ffmpeg-core.wasm?v=1", dest: "script", saveAs: "lib/ffmpeg-core.wasm" },
  { path: "lib/ffmpeg-core.worker.js?v=1", dest: "script", saveAs: "lib/ffmpeg-core.worker.js" },
  // File-explorer widget (lazy-loaded by the Storage Explorer options screen)
  { path: "lib/file-explorer/file-explorer.js", dest: "script", saveAs: "lib/file-explorer/file-explorer.js" },
  { path: "lib/file-explorer/file-explorer.css", dest: "style", saveAs: "lib/file-explorer/file-explorer.css" },

  // Config / runtime data
  { path: "config.ini", dest: "style" }, // text/plain; MANDATORY at boot
  { path: "servers.ini", dest: "style" }, // text/plain; multiplayer-only

  // CSS
  { path: "style.css?v=0.82.0", dest: "style", saveAs: "style.css" },
  { path: "res/fonts/fonts.css", dest: "style" },

  // App-bundled resources (loaded at boot / via res/)
  { path: "res/ra2cd.mix", dest: "script", saveAs: "res/ra2cd.mix" },
  { path: "res/locale/en-US.json", dest: "script", saveAs: "res/locale/en-US.json" },
  { path: "res/locale/zh-CN.json", dest: "script", saveAs: "res/locale/zh-CN.json" },
  { path: "res/locale/zh-TW.json", dest: "script", saveAs: "res/locale/zh-TW.json" },
  // UI images referenced by style.css (url(res/img/...))
  { path: "res/img/drag-archive.png", dest: "script", saveAs: "res/img/drag-archive.png" },
  { path: "res/img/drag-folder.png", dest: "script", saveAs: "res/img/drag-folder.png" },
  { path: "res/img/download-arrow.png", dest: "script", saveAs: "res/img/download-arrow.png" },
  { path: "res/img/cd-logo.png", dest: "script", saveAs: "res/img/cd-logo.png" },
  { path: "favicon.ico", dest: "script", saveAs: "favicon.ico" },
  // Optional UI pages (linked from config.ini but not required for SP)
  { path: "breaking-news.html", dest: "script", saveAs: "breaking-news.html", optional: true },
];

// Probe the full known locale set; only en-US/zh-CN/zh-TW exist, but keep the
// list so a re-run surfaces newly-added locales. Non-existent ones 404 and are
// marked optional above/below so they don't fail the run.
const OPTIONAL_LOCALES = ["en", "de", "fr", "ru", "es", "it", "ko", "pl", "pt-BR"];
for (const loc of OPTIONAL_LOCALES) {
  MANIFEST.push({
    path: `res/locale/${loc}.json`,
    dest: "script",
    saveAs: `res/locale/${loc}.json`,
    optional: true,
  });
}

// woff2 font files referenced by res/fonts/fonts.css (Fira Sans Condensed 500/600/700)
const FONT_FILES = [
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMl0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMB0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMh0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMd0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMt0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMp0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMR0cg.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMl0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMB0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMh0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMd0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMt0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMp0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMR0cg.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMl0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMB0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMh0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMd0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMt0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMp0ciZb.woff2",
  "wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMR0cg.woff2",
];
for (const f of FONT_FILES) {
  MANIFEST.push({ path: `res/fonts/${f}`, dest: "script", saveAs: `res/fonts/${f}` });
}

function downloadViaCurl(item) {
  const url = `${BASE_URL}/${item.path}`;
  const relPath = item.saveAs || item.path.split("?")[0];
  const outPath = join(OUT_DIR, relPath);
  mkdirSync(dirname(outPath), { recursive: true });

  const args = [
    "-sS", // silent but show errors
    "-L", // follow redirects
    "--retry", "3",
    "--retry-delay", "1",
    "--connect-timeout", "20",
    "--max-time", "180",
    "-w", "\n__HTTPSTATUS__%{http_code}",
    ...curlHeaderArgs(item.dest),
    "-o", outPath,
    url,
  ];

  const result = spawnSync("curl", args, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
  if (result.error) {
    return { ...item, url, ok: false, error: `curl spawn: ${result.error.message}` };
  }

  // curl writes the status trailer to stdout (we passed -w)
  const statusMatch = (result.stdout || "").match(/__HTTPSTATUS__(\d+)/);
  const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;

  if (status >= 200 && status < 300) {
    const buf = readFileSync(outPath);
    const sha = createHash("sha256").update(buf).digest("hex").slice(0, 16);
    return { ...item, url, ok: true, status, bytes: buf.length, sha };
  }

  // Clean up error bodies so they don't pollute client/
  if (existsSync(outPath)) {
    // keep small error pages for optional debugging but mark as non-ok
  }
  return { ...item, url, ok: false, status, optional: !!item.optional };
}

async function main() {
  if (LIST_ONLY) {
    for (const m of MANIFEST) console.log(`${m.path}  ->  ${m.saveAs || m.path.split("?")[0]}`);
    console.log(`\nTotal: ${MANIFEST.length} items`);
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const results = [];
  let ok = 0,
    failed = 0,
    optionalMiss = 0,
    totalBytes = 0;

  for (const item of MANIFEST) {
    process.stdout.write(`fetch ${item.path} ... `.padEnd(58));
    const r = downloadViaCurl(item);
    results.push(r);
    if (r.ok) {
      ok++;
      totalBytes += r.bytes;
      console.log(`OK ${String(r.bytes).padStart(9)}B  sha:${r.sha}`);
    } else if (r.optional && r.status === 404) {
      optionalMiss++;
      console.log(`MISS ${r.status} (optional)`);
    } else {
      failed++;
      console.log(`FAIL ${r.status || ""} ${r.error || ""}`);
    }
  }

  const report = {
    baseUrl: BASE_URL,
    fetchedAt: new Date().toISOString(),
    summary: { ok, failed, optionalMiss, totalBytes, count: MANIFEST.length },
    files: results.map((r) => ({
      path: r.saveAs || r.path.split("?")[0],
      status: r.status,
      bytes: r.bytes,
      sha: r.sha,
      ok: r.ok,
    })),
  };
  writeFileSync(join(OUT_DIR, ".fetch-manifest.json"), JSON.stringify(report, null, 2));

  console.log("\n=== SUMMARY ===");
  console.log(`ok:            ${ok}/${MANIFEST.length}`);
  console.log(`optional miss: ${optionalMiss}`);
  console.log(`failed:        ${failed}`);
  console.log(`downloaded:    ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`output:        ${OUT_DIR}`);

  if (failed > 0) {
    console.log("\nFailed items (may need manual export via browser):");
    results
      .filter((r) => !r.ok && !(r.optional && r.status === 404))
      .forEach((r) => console.log(`  - ${r.url}  (${r.status || r.error})`));
    process.exitCode = 1;
  }
}

main();
