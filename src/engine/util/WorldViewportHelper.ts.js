// === Reconstructed SystemJS module: engine/util/WorldViewportHelper ===
// deps: ["engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/util/WorldViewportHelper", ["engine/IsoCoords"], function (e, t) {
  "use strict";
  var a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "WorldViewportHelper",
        (i = class {
          constructor(e) {
            this.scene = e;
          }
          distanceToViewport(e) {
            var t = this.scene.viewport,
              t = new THREE.Box2(new THREE.Vector2(t.x, t.y), new THREE.Vector2(t.x + t.width - 1, t.x + t.height - 1));
            return this.distanceToScreenBox(e, t);
          }
          distanceToScreenBox(e, t) {
            var i = a.IsoCoords.vecWorldToScreen(e),
              r = a.IsoCoords.worldToScreen(0, 0),
              s = this.scene.cameraPan.getPan();
            return t.distanceToPoint(
              new THREE.Vector2(
                i.x - r.x - s.x + this.scene.viewport.width / 2,
                i.y - r.y - s.y + this.scene.viewport.height / 2,
              ),
            );
          }
          distanceToViewportCenter(e) {
            var t = a.IsoCoords.vecWorldToScreen(e),
              i = a.IsoCoords.worldToScreen(0, 0),
              r = this.scene.cameraPan.getPan(),
              s = this.scene.viewport;
            return new THREE.Vector2(
              t.x - i.x - r.x + this.scene.viewport.width / 2,
              t.y - i.y - r.y + this.scene.viewport.height / 2,
            ).sub(new THREE.Vector2(s.x + s.width / 2, s.y + s.height / 2));
          }
          intersectsScreenBox(e, t) {
            return 0 === this.distanceToScreenBox(e, t);
          }
        }),
      );
    },
  };
});
