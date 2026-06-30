#!/usr/bin/env node
/**
 * server/index.mjs — OpenYRWeb static server.
 *
 * Serves the built client from ../build/ (the OpenYRWeb product, produced by
 * `npm run build` = tools/build.mjs). The build is already self-contained and
 * offline-capable, so this server does NO runtime patching — it just serves files
 * with correct MIME types.
 *
 * Optional: ../assets/ra2files/ is NOT mounted by default (single-player uses the
 * File System Access folder picker). A future CDN-mode option can mount assets/ for
 * a local fake-CDN (see docs/architecture-and-offline-analysis.md §3).
 *
 * No npm dependencies, no globals. Pure Node http. (AGENTS.md compliant.)
 *
 * Usage:
 *   npm run build            # generate build/ first (required)
 *   node server/index.mjs [port]
 *   PORT=8080 node server/index.mjs
 */

import { createServer } from "node:http";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
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
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (p === "/" || p === "") p = "/index.html";
  const full = normalize(join(root, p));
  if (!full.startsWith(root + sep) && full !== root) return null; // traversal guard
  return full;
}

const server = createServer((req, res) => {
  // OpenYRWeb CORS proxy: GET /cors-proxy?url=<encoded-url>
  // Same-origin endpoint the browser uses to fetch cross-origin game installers
  // (e.g. archive.org) without CORS preflight failures. Forwards GET (incl. Range)
  // and streams the upstream response back with permissive CORS headers. Only
  // allows http/https targets; never follows redirects silently (we re-request
  // the Location, which is how archive.org's 302 to its CDN is handled).
  if (req.url.startsWith("/cors-proxy")) {
    handleCorsProxy(req, res);
    return;
  }
  // Debug-only: serve assets/ra2files/ at /__ra2files__/ with directory listing.
  if (DEBUG_ASSETS && req.url.startsWith("/__ra2files__/")) {
    const rel = decodeURIComponent(req.url.split("/__ra2files__/")[1].split("?")[0].split("#")[0]);
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

// OpenYRWeb CORS proxy handler: streams a cross-origin GET (with optional Range)
// back to the browser, adding Access-Control-Allow-Origin so the client can read it.
// Used by the one-click game importer (GameResImporter honors [CorsProxy] config).
async function handleCorsProxy(req, res) {
  const u = new URL(req.url, "http://x");
  const target = u.searchParams.get("url");
  if (!target) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("400 Bad Request: missing ?url=");
    return;
  }
  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("400 Bad Request: invalid url");
    return;
  }
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden: only http/https targets");
    return;
  }
  // Hop-by-hop request headers we must NOT forward.
  const forwardReqHeaders = {};
  const skipReq = new Set(["host", "connection", "content-length", "transfer-encoding"]);
  for (const [k, v] of Object.entries(req.headers)) {
    if (skipReq.has(k.toLowerCase())) continue;
    forwardReqHeaders[k] = v;
  }
  // Hop-by-hop response headers we must NOT forward.
  const skipRes = new Set([
    "connection", "content-length", "content-encoding", "transfer-encoding",
    "keep-alive", "content-security-policy", "x-content-security-policy",
  ]);
  const doRequest = (urlObj, remainingRedirects) => {
    const lib = urlObj.protocol === "https:" ? httpsRequest : httpRequest;
    const upstream = lib(
      urlObj,
      { method: "GET", headers: forwardReqHeaders },
      (upRes) => {
        // Follow redirects (archive.org download -> CDN is a 302).
        if ([301, 302, 303, 307, 308].includes(upRes.statusCode) && upRes.headers.location && remainingRedirects > 0) {
          upRes.resume(); // drain
          let next;
          try {
            next = new URL(upRes.headers.location, urlObj);
          } catch (e) {
            res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("502 Bad Gateway: bad redirect target");
            return;
          }
          return doRequest(next, remainingRedirects - 1);
        }
        // Build response headers: copy through useful headers, add permissive CORS.
        const outHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        };
        for (const [k, v] of Object.entries(upRes.headers)) {
          if (skipRes.has(k.toLowerCase())) continue;
          outHeaders[k] = v;
        }
        res.writeHead(upRes.statusCode || 502, outHeaders);
        upRes.pipe(res);
      },
    );
    upstream.on("error", (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("502 Bad Gateway: " + (err && err.message ? err.message : err));
      } else {
        try { res.end(); } catch (e) {}
      }
    });
    upstream.end();
  };
  // Handle CORS preflight (OPTIONS) for safety, though same-origin use won't send one.
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD, OPTIONS" });
    res.end("405 Method Not Allowed");
    return;
  }
  doRequest(targetUrl, 5);
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
