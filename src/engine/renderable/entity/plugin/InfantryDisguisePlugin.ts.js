// === Reconstructed SystemJS module: engine/renderable/entity/plugin/InfantryDisguisePlugin ===
// deps: ["engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/plugin/InfantryDisguisePlugin", ["engine/type/ObjectType"], function (e, t) {
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
        "InfantryDisguisePlugin",
        (i = class {
          constructor(e, t, i, r, s, a, n) {
            ((this.gameObject = e),
              (this.disguiseTrait = t),
              (this.localPlayer = i),
              (this.alliances = r),
              (this.renderable = s),
              (this.art = a),
              (this.gameSpeed = n),
              (this.canSeeThroughDisguise = !1));
          }
          onCreate() {}
          update(i) {
            if (!this.gameObject.isDestroyed && !this.gameObject.warpedOutTrait.isActive()) {
              let e = this.disguiseTrait.getDisguise();
              var r;
              e !== this.lastDisguise && ((this.lastDisguise = e), (this.disguisedAt = e ? i : void 0));
              let t = this.localPlayer.value;
              (e &&
                (this.canSeeThroughDisguise =
                  !t ||
                  this.alliances.haveSharedIntel(t, this.gameObject.owner) ||
                  !!t.sharedDetectDisguiseTrait?.has(this.gameObject)),
                e &&
                  this.canSeeThroughDisguise &&
                  (e = t?.sharedDetectDisguiseTrait?.has(this.gameObject)
                    ? void 0
                    : Math.floor(((i - this.disguisedAt) * this.gameSpeed.value) / 1e3) % 16 <= 3
                      ? e
                      : void 0),
                this.lastRenderDisguise !== e &&
                  ((this.lastRenderDisguise = e),
                  e
                    ? ((r = this.art.getObject(e.rules.name, s.ObjectType.Infantry)),
                      this.renderable.setDisguise({ objectArt: r, owner: e.owner }))
                    : this.renderable.setDisguise(void 0)));
            }
          }
          onRemove() {}
          getUiNameOverride() {
            var e = this.gameObject.disguiseTrait?.getDisguise();
            if (e && !this.canSeeThroughDisguise) return e.rules.uiName;
          }
          dispose() {}
        }),
      );
    },
  };
});
