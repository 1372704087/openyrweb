#!/usr/bin/env node
/**
 * tests/vxl-shadow-proxy.mjs — behaviour test for the air-unit shadow cap.
 *
 * Symptom being fixed: VXL aircraft cast their real-time (shadow map) shadow from
 * their true altitude. The sun is ~46° off vertical, so the horizontal shadow
 * offset is `height * 1.0468` — an Intruder at FlightLevel=1500 therefore throws
 * its shadow ~6 tiles away from the hull.
 *
 * Fix: air units stop casting from the body; an invisible clone (VxlShadowProxy)
 * casts from a *capped* altitude instead, which caps the offset at ~1 tile.
 *
 * This test loads the real module out of src/ (SystemJS register format) with a
 * minimal System shim and asserts:
 *   1. the derived slope / cap constants,
 *   2. computeSink() clamping and its boundaries,
 *   3. the clone tree wiring (invisible material, castShadow, manual matrices,
 *      field back-fill needed by the batch manager),
 *   4. BatchedMesh.clone() survives (its constructor takes geometry/material),
 *   5. update() mirrors transforms and applies the sink.
 *
 * Run: node tests/vxl-shadow-proxy.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url);

/** 孪生优先；删除后回退 build/ts-modules 编译产物（同为具名 System.register，本 shim 兼容两态）。 */
function resolveModulePath(rel) {
  if (existsSync(new URL(rel, ROOT))) return rel;
  const compiled = rel.replace(/^src\//, "build/ts-modules/").replace(/\.ts\.js$/, ".js");
  if (existsSync(new URL(compiled, ROOT))) return compiled;
  throw new Error("module not found (run: npm run build:ts): " + rel);
}

// vendor/ three is a UMD build, but this package is "type": "module", so a plain
// require() would load it as ESM and blow up on `this`. Hand it the UMD globals.
const threeExports = {};
new Function("exports", "module", "define", readFileSync(new URL("vendor/lib/three.min.js", ROOT), "utf8"))(
  threeExports,
  { exports: threeExports },
  undefined,
);
const THREE = threeExports;
globalThis.THREE = THREE;

/* ---------------------------------------------------------------- System shim */

/** Execute a System.register module file and return its exported values.
 *  `deps` maps a dependency name to the value its setter should receive. */
function loadModule(relPath, deps = {}) {
  const src = readFileSync(new URL(relPath, ROOT), "utf8");
  const seen = new Set();
  const out = {};
  const System = {
    register(name, depNames, factory) {
      if (seen.has(name)) return;
      seen.add(name);
      const rec = factory((key, value) => (out[key] = value), { id: name });
      depNames.forEach((d, i) => rec.setters[i](deps[d]));
      rec.execute();
    },
  };
  // Same realm (new Function, not vm) so THREE class identity is preserved.
  new Function("System", "THREE", src)(System, THREE);
  return out;
}

/* ----------------------------------------------------------------- assertions */

let failures = 0;
const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;
function check(label, cond, extra = "") {
  if (cond) console.log("  ok   " + label);
  else {
    failures++;
    console.log("  FAIL " + label + (extra ? "  <- " + extra : ""));
  }
}

/* ------------------------------------------------------------- module load-up */

// game/Coords — only the two statics the proxy reads.
const Z_SCALE = Math.cos(Math.PI / 4) / Math.cos(Math.PI / 6);
const Coords = {
  LEPTONS_PER_TILE: 256,
  tileHeightToWorld: (v) => v * (256 / 2) * Z_SCALE,
};

const bmExports = loadModule(resolveModulePath("src/engine/gfx/batch/BatchedMesh.ts.js"));
const BatchedMesh = bmExports.BatchedMesh;
const BatchMode = bmExports.BatchMode;
check("BatchedMesh module loads", typeof BatchedMesh === "function");
check("BatchMode exported", BatchMode && BatchMode.Instancing === 0);

const modExports = loadModule(resolveModulePath("src/engine/renderable/entity/unit/VxlShadowProxy.ts.js"), {
  "game/Coords": { Coords },
});
const VxlShadowProxy = modExports.VxlShadowProxy;
check("VxlShadowProxy module loads", typeof VxlShadowProxy === "function");

/* ------------------------------------------------------- 1. constants / slope */

console.log("\n[1] constants");
const slope = VxlShadowProxy.SHADOW_OFFSET_PER_HEIGHT;
// WorldScene.directionalLight position(-87.012, 204.338, 195.409) -> target(0,0,0).
check("shadow offset slope ~1.0468", near(slope, 1.046833, 1e-5), "got " + slope);
check("cap offset == 0.5 tile", VxlShadowProxy.MAX_SHADOW_OFFSET === 128);
const maxH = VxlShadowProxy.MAX_PROJECTION_HEIGHT;
check("max projection height ~122.3", near(maxH, 128 / slope, 1e-9), "got " + maxH);
check("cap offset reproduces 0.5 tile", near(maxH * slope, 128, 1e-6));
check("hidden material is colour/depth-free",
  VxlShadowProxy.material && VxlShadowProxy.material.colorWrite === false &&
  VxlShadowProxy.material.depthWrite === false && VxlShadowProxy.material.depthTest === false);
check("hidden material still visible to the shadow pass",
  VxlShadowProxy.material.visible === true);

/* ------------------------------------------------------------ 2. computeSink */

console.log("\n[2] computeSink()");
// Ground is taken from tile.z (terrain layer), matching the locomotor's own baseline.
function sinkFor(worldY, tileZ = 0) {
  const proxy = new VxlShadowProxy({
    position: { worldPosition: { x: 0, y: worldY, z: 0 }, getBridgeBelow: () => undefined },
    tile: { z: tileZ },
  });
  return proxy.computeSink();
}
const intruder = sinkFor(1500); // FlightLevel=1500 (Aircraft=yes)
const kirov = sinkFor(500); // JumpjetHeight=500
check("Intruder (h=1500) sinks 1377.7", near(intruder, 1500 - maxH, 1e-6), "got " + intruder);
check("Kirov (h=500) sinks 377.7", near(kirov, 500 - maxH, 1e-6), "got " + kirov);
check("below the cap (h=100) is not clamped", sinkFor(100) === 0);
check("grounded (h=0) is not clamped", sinkFor(0) === 0);
check("elevated terrain is measured against the ground",
  near(sinkFor(Coords.tileHeightToWorld(2) + 100, 2), 0, 1e-9),
  "got " + sinkFor(Coords.tileHeightToWorld(2) + 100, 2));
// A bridge deck is the ground the shadow must land on, not the terrain under it.
const overBridge = new VxlShadowProxy({
  position: {
    worldPosition: { x: 0, y: Coords.tileHeightToWorld(4) + 500, z: 0 },
    getBridgeBelow: () => ({ tileElevation: 4 }),
  },
  tile: { z: 0 },
});
check("bridge deck counts as the ground", near(overBridge.computeSink(), 500 - maxH, 1e-6),
  "got " + overBridge.computeSink());
// Regression guard: in the real game position.tileElevation is reverse-computed from
// worldPosition when unset (ObjectPosition.computeTileElevationFromWorldPos), so for an
// airborne unit it equals its own altitude. Using it as "ground" makes the sink collapse
// to 0 and silently disables the whole cap — that bug shipped once.
const trap = new VxlShadowProxy({
  position: { worldPosition: { x: 0, y: 1500, z: 0 }, getBridgeBelow: () => undefined },
  tile: { z: 0 },
  tileElevation: 1500 / (128 * Z_SCALE),
});
check("ignores the reverse-computed tileElevation",
  near(trap.computeSink(), 1500 - maxH, 1e-6), "got " + trap.computeSink());
// Cap yields exactly half a tile of horizontal offset for the worst case.
check("capped offset stays ~0.5 tile at h=1500",
  near((1500 - intruder) * slope, 128, 1e-6), "got " + (1500 - intruder) * slope);

/* ------------------------------------------------- 3. clone tree + back-fill */

console.log("\n[3] clone tree");
function buildSourceTree() {
  const tilt = new THREE.Object3D();
  tilt.rotation.order = "YXZ";
  const main = new THREE.Object3D();
  main.matrixAutoUpdate = false;
  const inner = new THREE.Object3D();
  inner.rotation.x = -Math.PI / 2;
  inner.matrixAutoUpdate = false;
  const geom = new THREE.BufferGeometry();
  geom.addAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
  const m1 = new BatchedMesh(geom, new THREE.MeshBasicMaterial());
  const m2 = new BatchedMesh(geom, new THREE.MeshBasicMaterial());
  m1.matrixAutoUpdate = false;
  m2.matrixAutoUpdate = false;
  inner.add(m1, m2);
  main.add(inner);
  tilt.add(main);
  return { tilt, nodes: 5 };
}

const src = buildSourceTree();
const parent = new THREE.Object3D();
const proxy = new VxlShadowProxy({
  position: { worldPosition: { x: 0, y: 1500, z: 0 }, getBridgeBelow: () => undefined },
  tile: { z: 0 },
});
proxy.create3DObject(parent, src.tilt);

const wrap = proxy.wrap;
check("wrap attached to parent", wrap && parent.children.includes(wrap));
check("wrap named vxl_shadow_proxy", wrap.name === "vxl_shadow_proxy");
check("wrap uses a manual matrix", wrap.matrixAutoUpdate === false);
check("wrap starts hidden (proxy disabled)", wrap.visible === false && proxy.enabled === false);
check("clone root is a distinct object", wrap.children[0] && wrap.children[0] !== src.tilt);

const srcNodes = [];
src.tilt.traverse((o) => srcNodes.push(o));
const cloneNodes = [];
wrap.children[0].traverse((o) => cloneNodes.push(o));
check("clone mirrors every node", cloneNodes.length === srcNodes.length, cloneNodes.length + " vs " + srcNodes.length);
check("pairs pair src->clone one-to-one", proxy.pairs.length === srcNodes.length);
check("pairs[0] is the clone root",
  proxy.pairs[0][0] === src.tilt && proxy.pairs[0][1] === wrap.children[0]);

let allManual = true;
wrap.children[0].traverse((o) => { if (o.matrixAutoUpdate !== false) allManual = false; });
check("every clone node uses a manual matrix", allManual);

const cloneMeshes = [];
wrap.children[0].traverse((o) => o.isMesh && cloneMeshes.push(o));
check("both VXL sections cloned", cloneMeshes.length === 2);
check("clone meshes share the body geometry",
  cloneMeshes[0].geometry === src.tilt.children[0].children[0].children[0].geometry);
check("clone meshes carry the hidden material",
  cloneMeshes.every((m) => m.material === VxlShadowProxy.material));
check("clone meshes cast shadows",
  cloneMeshes.every((m) => m.castShadow === true && m.receiveShadow === false));
check("clone meshes keep isBatchedMesh",
  cloneMeshes.every((m) => m.isBatchedMesh === true), JSON.stringify(cloneMeshes.map((m) => m.isBatchedMesh)));
check("clone meshes are batched in Instancing mode",
  cloneMeshes.every((m) => m.batchMode === BatchMode.Instancing));
// Regression guard: the proxy must only rewrite the clone's matrices. Touching the
// body's would freeze Aircraft's tiltObj (it relies on matrixAutoUpdate === true).
check("body root keeps its automatic matrix", src.tilt.matrixAutoUpdate === true);
// Fields the batch manager reads but clone() drops.
check("clone meshes back-filled for the batch manager",
  cloneMeshes.every((m) =>
    Array.isArray(m.clippingPlanes) && m.clippingPlanesHash === "" &&
    m.opacity === 1 && m.paletteIndex === 0 &&
    m.extraLight && m.lightDir));
check("body material is untouched",
  cloneMeshes.every((m) => m.material !== src.tilt.children[0].children[0].children[0].material));

/* ------------------------------------------------------- 4. enable / disable */

console.log("\n[4] enable / disable");
proxy.setEnabled(true);
check("enabled -> wrap visible", wrap.visible === true && proxy.enabled === true);
proxy.setEnabled(false);
check("disabled -> wrap hidden and sink cleared",
  wrap.visible === false && wrap.position.y === 0);
proxy.setEnabled(true);

/* ------------------------------------------------------------- 5. update() */

console.log("\n[5] update()");
// Body rotation (tiltObj yaw) must be mirrored onto the clone.
src.tilt.rotation.y = THREE.Math.degToRad(90);
src.tilt.updateMatrix();
proxy.update();
const cloneTilt = wrap.children[0];
check("rotation mirrored to clone", near(cloneTilt.rotation.y, Math.PI / 2, 1e-9),
  "got " + cloneTilt.rotation.y);
check("sink applied to wrap (h=1500)", near(wrap.position.y, -(1500 - maxH), 1e-6),
  "got " + wrap.position.y);

// A child that flips visibility must mirror too (turret / spawn-alt toggles).
const srcInnerMesh = src.tilt.children[0].children[0].children[0];
srcInnerMesh.visible = false;
proxy.update();
check("hidden child mirrored", wrap.children[0].children[0].children[0].children[0].visible === false);

// Below the cap the proxy sits exactly where the body is (no double shadow).
const lowProxy = new VxlShadowProxy({
  position: { worldPosition: { x: 0, y: 60, z: 0 }, getBridgeBelow: () => undefined },
  tile: { z: 0 },
});
lowProxy.create3DObject(new THREE.Object3D(), src.tilt);
lowProxy.setEnabled(true);
lowProxy.update();
check("below the cap the sink is zero", lowProxy.wrap.position.y === 0);

/* --------------------------------------------------------------- 6. dispose */

console.log("\n[6] dispose");
proxy.dispose();
check("wrap detached and state cleared",
  proxy.wrap === undefined && proxy.pairs.length === 0 &&
  proxy.enabled === false && !parent.children.includes(proxy.wrap));
check("shared hidden material survives dispose", VxlShadowProxy.material.colorWrite === false);

/* ------------------------------------------------------------------ summary */

console.log("\n=== " + (failures === 0 ? "PASS ✅" : "FAIL ❌ " + failures + " check(s)") + " ===");
process.exit(failures === 0 ? 0 : 1);
