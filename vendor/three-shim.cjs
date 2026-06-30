// three-shim.cjs — bridges the global window.THREE (loaded by lib/three.min.js and
// registered as the SystemJS "three" module by index.html) into CJS `require("three")`
// for the few FOSS addons we bundle (three.meshline). Lets esbuild inline a plain
// property read instead of leaving a dynamic require() that fails in the browser.
module.exports =
  typeof window !== "undefined" && window.THREE
    ? window.THREE
    : typeof globalThis !== "undefined" && globalThis.THREE
      ? globalThis.THREE
      : {};
