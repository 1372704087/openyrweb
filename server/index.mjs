#!/usr/bin/env node
/**
 * server/index.mjs — OpenYRWeb local static server (pure single-player).
 *
 * Serves the built client from ../build/ (the OpenYRWeb product, produced by
 * `npm run build` = tools/build.mjs). The build is already self-contained and
 * offline-capable, so this server does NO runtime patching — it just serves files
 * with correct MIME types.
 *
 * Bind: 127.0.0.1 only. No proxy, no upload, no database, no auth surface.
 * The one-click archive.org import is disabled by blanking the archive URLs in
 * server/config/config.ini, so the client relies solely on local game files
 * (File System Access folder picker / archive import).
 *
 * Usage:
 *   npm run build            # generate build/ first (required)
 *   node server/index.mjs [port]
 *   PORT=8080 node server/index.mjs
 */

import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const BUILD_DIR = join(ROOT, "build");
const ASSETS_DIR = join(ROOT, "assets", "ra2files");
const PORT = parseInt(process.env.PORT || process.argv[2] || "8080", 10);
// Debug-only mount of assets/ra2files/ at /__ra2files__/ for headless browser
// debugging (synthetic FileSystemDirectoryHandle fetches each file via this path).
// Default OFF; enable with YRWEB_DEBUG_ASSETS=1. Never on in production deploys.
const DEBUG_ASSETS = process.env.YRWEB_DEBUG_ASSETS === "1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ini": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pcx": "application/octet-stream",
  ".mix": "application/octet-stream",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(root, urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  } catch (e) {
    return null; // malformed percent-encoding -> treat as forbidden
  }
  if (p === "/" || p === "") p = "/index.html";
  const full = normalize(join(root, p));
  if (!full.startsWith(root + sep) && full !== root) return null; // traversal guard
  return full;
}

const server = createServer((req, res) => {
  // Debug-only: serve assets/ra2files/ at /__ra2files__/ with directory listing.
  if (DEBUG_ASSETS && req.url.startsWith("/__ra2files__/")) {
    let rel;
    try {
      rel = decodeURIComponent(req.url.split("/__ra2files__/")[1].split("?")[0].split("#")[0]);
    } catch (e) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }
    const full = normalize(join(ASSETS_DIR, rel));
    if (!full.startsWith(ASSETS_DIR + sep) && full !== ASSETS_DIR) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (!existsSync(full)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found: " + req.url);
      return;
    }
    const st = statSync(full);
    if (st.isDirectory()) {
      const entries = readdirSync(full).map((name) => {
        const isDir = statSync(join(full, name)).isDirectory();
        return { name, kind: isDir ? "directory" : "file" };
      });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify(entries));
      return;
    }
    const ext = extname(full).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": st.size,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(full).pipe(res);
    return;
  }

  const filePath = safeJoin(BUILD_DIR, req.url);
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found: " + req.url);
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stat = statSync(filePath);

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
});

if (!existsSync(BUILD_DIR)) {
  console.error("build/ not found. Run `npm run build` first.");
  process.exit(1);
}

server.listen(PORT, "127.0.0.1", () => {
  console.log("OpenYRWeb — static server");
  console.log("  root: " + BUILD_DIR);
  console.log("  open: http://127.0.0.1:" + PORT + "/");
  if (DEBUG_ASSETS) {
    console.log("  [debug] assets mounted at /__ra2files__/ (YRWEB_DEBUG_ASSETS=1)");
  }
  console.log("  (Ctrl-C to stop)");
  console.log("");
  console.log("  First run: click \"Browse folder\" in the game-resources dialog and");
  console.log("  select a folder containing ra2.mix, ra2md.mix, language.mix/langmd.mix,");
  console.log("  multi.mix/multimd.mix, etc. (your own RA2/YR install).");
});
