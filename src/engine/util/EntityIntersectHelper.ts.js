// === Reconstructed SystemJS module: engine/util/EntityIntersectHelper ===
// deps: ["util/geometry"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/util/EntityIntersectHelper", ["util/geometry"], function (e, t) {
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
        "EntityIntersectHelper",
        (i = class {
          constructor(e, t, i, r, s, a) {
            ((this.map = e),
              (this.renderableManager = t),
              (this.mapTileIntersectHelper = i),
              (this.raycastHelper = r),
              (this.scene = s),
              (this.worldViewportHelper = a));
          }
          getEntitiesAtScreenBox(t) {
            let e = this.renderableManager.getRenderableContainer();
            if (!e) return [];
            let i = this.collectIntersectTargets(e.get3DObject()),
              r = new Set();
            return (
              i.forEach((e) => r.add(this.renderableManager.getRenderableById(this.findRenderableId(e)))),
              [...r].filter((e) => this.worldViewportHelper.intersectsScreenBox(e.gameObject.position.worldPosition, t))
            );
          }
          getEntityAtScreenPoint(i) {
            var r = this.scene.viewport;
            if (a.rectContainsPoint(r, i)) {
              let e = this.renderableManager.getRenderableContainer();
              if (e) {
                var s = this.collectIntersectTargets(e.get3DObject());
                let t = this.raycastHelper.intersect(i, s, !1);
                if (t.length) {
                  let e = t.map((e) => ({
                    renderable: this.renderableManager.getRenderableById(this.findRenderableId(e.object)),
                    point: e.point,
                  }));
                  r = e.find((e) => e.renderable.gameObject.isUnit());
                  if (r) return r;
                  s = e.find((e) => e.renderable.gameObject.isBuilding() && e.renderable.getIntersectTarget?.());
                  if (!s) return e[0];
                  r = this.mapTileIntersectHelper.getTileAtScreenPoint(i);
                  if (r) {
                    r = this.map.getObjectsOnTile(r).find((e) => {
                      if (!e.isBuilding()) return !1;
                      let t = this.renderableManager.getRenderableByGameObject(e);
                      return void 0 !== t.getIntersectTarget?.();
                    });
                    if (r) return { renderable: this.renderableManager.getRenderableByGameObject(r), point: s.point };
                  }
                }
              }
            }
          }
          collectIntersectTargets(t) {
            let i = [];
            if (!t.visible) return i;
            if (void 0 !== t.userData.id) {
              let e = this.renderableManager.getRenderableById(t.userData.id);
              if (!e) throw new Error(`Entity not found (id = "${t.userData.id}")`);
              var r;
              e.gameObject.isDestroyed ||
                e.gameObject.isCrashing ||
                ((r = e.getIntersectTarget?.()), Array.isArray(r) ? i.push(...r) : r && i.push(r));
            }
            return (
              t.children.forEach((e) => {
                e.visible && i.push(...this.collectIntersectTargets(e));
              }),
              i
            );
          }
          findRenderableId(e) {
            let t;
            for (; (t = e.userData.id), (e = e.parent), void 0 === t && e.parent;);
            if (void 0 === t) throw new Error("No attached renderable ID found for Object3D.");
            return t;
          }
        }),
      );
    },
  };
});
