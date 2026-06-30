// === Reconstructed SystemJS module: engine/renderable/entity/plugin/MindControlLinkPlugin ===
// deps: ["engine/renderable/fx/MindControlLinkFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/MindControlLinkPlugin",
  ["engine/renderable/fx/MindControlLinkFx"],
  function (e, t) {
    "use strict";
    var o, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "MindControlLinkPlugin",
          (i = class {
            constructor(e, t, i, r) {
              ((this.source = e),
                (this.selectionModel = t),
                (this.alliances = i),
                (this.viewer = r),
                (this.links = new Map()));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update() {
              if (!this.source.isDestroyed && !this.source.isCrashing && this.source.mindControllerTrait)
                if (
                  !this.selectionModel.isSelected() ||
                  (this.viewer.value && !this.alliances.haveSharedIntel(this.source.owner, this.viewer.value))
                )
                  this.disposeLinks();
                else {
                  let e = this.source.mindControllerTrait.getTargets();
                  for (var [t, i] of this.links.entries())
                    e.includes(t) || (i.removeAndDispose(), this.links.delete(t));
                  var r,
                    s = new THREE.Color(this.source.owner.color.asHex()),
                    a = this.source.position.worldPosition.clone();
                  for (r of e) {
                    var n = r.position.worldPosition.clone();
                    let e = this.links.get(r);
                    (e ||
                      ((e = new o.MindControlLinkFx(a, n, s, 2)),
                      this.links.set(r, e),
                      this.renderableManager?.addEffect(e)),
                      e.updateEndpoints(a, n));
                  }
                }
            }
            onRemove() {
              ((this.renderableManager = void 0), this.disposeLinks());
            }
            dispose() {
              this.disposeLinks();
            }
            disposeLinks() {
              (this.links.forEach((e) => e.removeAndDispose()), this.links.clear());
            }
          }),
        );
      },
    };
  },
);
