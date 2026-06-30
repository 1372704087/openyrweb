// === Reconstructed SystemJS module: engine/renderable/entity/plugin/ForcedDisguisePlugin ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/plugin/ForcedDisguisePlugin", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ForcedDisguisePlugin",
        (i = class {
          constructor(e, t, i, r) {
            ((this.gameObject = e), (this.disguiseArt = t), (this.localPlayer = i), (this.renderable = r));
          }
          onCreate() {}
          update(e) {
            var t;
            this.gameObject.isDestroyed ||
              this.gameObject.warpedOutTrait.isActive() ||
              ((t = this.canSeeThroughDisguise),
              (this.canSeeThroughDisguise = this.localPlayer.value === this.gameObject.owner),
              this.canSeeThroughDisguise !== t &&
                (this.canSeeThroughDisguise
                  ? this.renderable.setDisguise(void 0)
                  : this.renderable.setDisguise({ objectArt: this.disguiseArt, owner: this.gameObject.owner })));
          }
          onRemove() {}
          getUiNameOverride() {
            if (!this.canSeeThroughDisguise) return this.disguiseArt.rules.uiName;
          }
          dispose() {}
        }),
      );
    },
  };
});
