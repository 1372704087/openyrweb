// === Reconstructed SystemJS module: engine/gfx/OverlayUtils ===
// deps: ["engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/OverlayUtils", ["engine/gfx/CanvasUtils"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "OverlayUtils",
        (i = class {
          static createGroundCircle(e, t) {
            var i = new THREE.LineBasicMaterial({ color: t, transparent: !0, depthTest: !1, depthWrite: !1 });
            let r = new THREE.CircleGeometry(e, 64);
            (r.vertices.shift(), r.vertices.push(r.vertices[0]));
            let s = new THREE.Line(r, i);
            return ((s.rotation.x = Math.PI / 2), (s.renderOrder = 1e6), s);
          }
          static createTextBox(e, t) {
            let i = document.createElement("canvas");
            i.width = i.height = 0;
            var r = i.getContext("2d", { alpha: !t.backgroundColor || !!t.backgroundColor.match(/^rgba/) });
            return (s.CanvasUtils.drawText(r, e, 0, 0, { ...t, autoEnlargeCanvas: !0 }), i);
          }
        }),
      );
    },
  };
});
