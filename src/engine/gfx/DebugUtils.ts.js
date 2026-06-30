// === Reconstructed SystemJS module: engine/gfx/DebugUtils ===
// deps: ["game/Coords","data/Bitmap","three"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/DebugUtils", ["game/Coords", "data/Bitmap", "three"], function (e, t) {
  "use strict";
  var o, a, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        a = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "DebugUtils",
        (r = class {
          static createWireframe(e, t) {
            return new i.Mesh(this.createBoxGeometry(e, t), new THREE.MeshBasicMaterial({ wireframe: !0 }));
          }
          static createBoxGeometry(e, t, i = !1) {
            var r = o.Coords.getWorldTileSize(),
              s = e.width * r,
              a = e.height * r,
              r = o.Coords.tileHeightToWorld(t);
            let n = new THREE.BoxBufferGeometry(s, r, a);
            return (i ? n.translate(0, r / 2, 0) : n.translate(s / 2, r / 2, a / 2), n);
          }
          static createIndexedCheckerTex(e, t) {
            let i = new a.IndexedBitmap(64, 64, new Uint8Array(4096).fill(e));
            for (let s = 0; s < 32; s++)
              for (let e = 0; e < 32; e++) ((i.data[s + 64 * e] = t), (i.data[s + 32 + 64 * (e + 32)] = t));
            let r = new THREE.DataTexture(i.data, 64, 64, THREE.AlphaFormat);
            return ((r.needsUpdate = !0), (r.minFilter = THREE.NearestFilter), (r.magFilter = THREE.NearestFilter), r);
          }
        }),
      );
    },
  };
});
