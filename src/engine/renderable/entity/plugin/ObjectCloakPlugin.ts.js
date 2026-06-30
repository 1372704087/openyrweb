// === Reconstructed SystemJS module: engine/renderable/entity/plugin/ObjectCloakPlugin ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/plugin/ObjectCloakPlugin", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ObjectCloakPlugin",
        (i = class {
          constructor(e, t, i, r) {
            ((this.gameObject = e),
              (this.localPlayer = t),
              (this.alliances = i),
              (this.renderable = r),
              (this.lastCanSeeThroughCloak = !1));
          }
          onCreate() {}
          update(e) {
            var t = !!this.gameObject.cloakableTrait?.isCloaked() && !this.gameObject.isDestroyed,
              i = t !== this.lastCloaked,
              r =
                t &&
                (!this.localPlayer.value ||
                  this.alliances.haveSharedIntel(this.localPlayer.value, this.gameObject.owner)),
              s = r !== this.lastCanSeeThroughCloak;
            (i || s) &&
              ((this.lastCloaked = t),
              (this.lastCanSeeThroughCloak = r),
              (this.renderable.get3DObject().visible = !t || r));
          }
          onRemove() {}
          dispose() {}
        }),
      );
    },
  };
});
