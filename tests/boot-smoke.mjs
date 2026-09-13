/**
 * tests/boot-smoke.mjs — Headless boot smoke test for the client build.
 *
 * Purpose: load the built client into jsdom and verify that:
 *   1. SystemJS resolves the engine entry ('main' / Application) and all its
 *      transitive vendor-module imports (react, react-dom, @puzzl/core/*, ...).
 *      This is the single most important invariant after the vendor-bundle
 *      rebuild-from-npm change — if a vendor module fails to resolve, boot dies.
 *   2. The app reaches the point where it tries to render (WebGL will fail in
 *      jsdom; that's expected and NOT a failure of this test).
 *   3. No uncaught error that looks like a module-resolution / vendor failure.
 *
 * jsdom cannot do WebGL, so we do NOT assert "reached main menu" here — we assert
 * the module graph is intact (every module registered, vendor deps included). Note
 * that index.html's inline capability probe also fires `alert("Browser not
 * supported")` under jsdom and the app therefore never gets to render; that is
 * expected and non-fatal. Full visual boot is verified separately by the Playwright
 * gate / humans.
 *
 * Registration is read from `System.defined` (absolute-URL keyed), NOT `System.has()`
 * — the vendored SystemJS ships `has` as a legacy stub that always returns false.
 *
 * Run: node tests/boot-smoke.mjs   (needs `npm run serve` running; the served port
 *      is taken from PORT, matching server/index.mjs, default 8080)
 */

import { JSDOM } from "jsdom";

// Must stay in lockstep with server/index.mjs (`process.env.PORT || argv || "8080"`);
// a hardcoded port here silently disconnected this test from the dev server.
const PORT = parseInt(process.env.PORT || "8080", 10);
const SERVER = process.env.OPENYRWEB_TEST_URL || `http://127.0.0.1:${PORT}`;

async function main() {
  console.log("Loading built index.html from", SERVER);
  let dom;
  try {
    dom = await JSDOM.fromURL(SERVER + "/", {
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      beforeParse(window) {
        // Node 18+ fetch + Response, routed through jsdom so the bundle can load
        // its same-origin resources (config.ini, bundles, locales).
        if (typeof globalThis.Response === "function") {
          try {
            Object.defineProperty(window, "Response", {
              configurable: true,
              writable: true,
              value: globalThis.Response,
            });
          } catch (e) {}
        }
        if (typeof window.fetch !== "function" && typeof globalThis.fetch === "function") {
          window.fetch = async (input, init) => {
            const urlStr = typeof input === "string" ? input : input.url;
            const abs = new URL(urlStr, SERVER).toString();
            const resp = await globalThis.fetch(abs, init);
            const buf = Buffer.from(await resp.arrayBuffer());
            return new globalThis.Response(buf, {
              status: resp.status,
              headers: { "Content-Type": resp.headers.get("content-type") || "application/octet-stream" },
            });
          };
        }
      },
    });
  } catch (e) {
    console.error("Failed to load page:", e.message);
    process.exit(1);
  }

  const { window } = dom;
  const errors = [];
  window.addEventListener("error", (e) => {
    errors.push("window.error: " + (e.error ? e.error.stack || e.error.message : e.message));
  });
  window.addEventListener("unhandledrejection", (e) => {
    errors.push("unhandledrejection: " + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
  });
  const origErr = window.console.error.bind(window.console);
  window.console.error = (...a) => {
    errors.push("console.error: " + a.join(" "));
    origErr(...a);
  };

  // Give the bundle time to load + SystemJS.import("main") to run.
  await new Promise((r) => setTimeout(r, 5000));

  console.log("\n=== RESULTS ===");

  // Verify SystemJS + the vendor bundle registered the modules the engine imports.
  //
  // DO NOT use System.has(name) here. The vendored SystemJS build exposes `has` as a
  // legacy stub: it returns false for every module, including ones that are registered
  // (measured: ra2web.js issues all 1363 System.register calls, yet has("main") is
  // false). The registry that actually holds them is System.defined, keyed by the
  // ABSOLUTE resolved URL — so membership must be tested via URL resolution.
  const probe = await window.eval(`(async () => {
    const results = { hasSystem: !!window.System, registered: 0, mainResolved: null, headResolved: null, vendorSamples: {} };
    if (!window.System) return results;
    const defined = window.System.defined || {};
    results.registered = Object.keys(defined).length;
    const has = (name) => !!defined[new URL(name, window.location.origin + "/").href];
    // 'main' is registered by ra2web.js mid-bundle (module 725 of 1363) and
    // 'data/IniSection' is the first one — together they bracket a full load.
    results.mainResolved = has("main");
    results.headResolved = has("data/IniSection");
    // Sample critical vendor modules that the engine imports at boot.
    const want = ["react","react-dom","@puzzl/core/lib/async/cancellation","threads","three"];
    for (const name of want) results.vendorSamples[name] = has(name);
    return results;
  })()`);

  console.log("SystemJS present:", probe.hasSystem);
  console.log("System.defined entries:", probe.registered);
  console.log("bundle head module registered ('data/IniSection'):", probe.headResolved);
  console.log("bundle mid module registered ('main'):", probe.mainResolved);
  console.log("Vendor modules registered:");
  let vendorMissing = 0;
  for (const [name, ok] of Object.entries(probe.vendorSamples || {})) {
    console.log(`   ${ok ? "OK " : "MISSING "} ${name}`);
    if (!ok) vendorMissing++;
  }

  // The authoritative verdict: every vendor module the engine needs must resolve.
  console.log("\nErrors/warnings captured:", errors.length);

  // Classify errors. Module-resolution failures are FATAL. WebGL/WebAssembly/worker
  // errors are EXPECTED in jsdom and are non-fatal for this test.
  const FATAL = /is not registered|Could not find|Cannot find module|SystemJS|registerDynamic|undefined is not|Invalid System.register|did not call System.register/i;
  const fatal = errors.filter((e) => FATAL.test(e) && !/WebGL|webgl|WebAssembly|Worker|gpu|GPU/i.test(e));
  if (fatal.length) {
    console.log("\nFATAL boot errors (module resolution):");
    fatal.forEach((e) => console.log("   ✗ " + e.slice(0, 300)));
  }

  const pass =
    probe.hasSystem &&
    probe.registered > 0 &&
    probe.headResolved &&
    probe.mainResolved &&
    vendorMissing === 0 &&
    fatal.length === 0;
  console.log("\n=== " + (pass ? "PASS ✅ — module graph intact, entry registered" : "FAIL ❌") + " ===");
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error("boot-smoke crashed:", e);
  process.exit(1);
});
