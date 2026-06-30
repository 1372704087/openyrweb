// === Reconstructed SystemJS module: engine/renderable/entity/plugin/ChronoSparkleFxPlugin ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/plugin/ChronoSparkleFxPlugin", ["game/Coords"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "ChronoSparkleFxPlugin",
        (i = class {
          constructor(e, t) {
            ((this.gameObject = e),
              (this.sparkleAnimName = t),
              (this.objMoveTrait = e.isUnit() ? e.moveTrait : void 0));
          }
          onCreate(e) {
            this.renderableManager = e;
          }
          update() {
            if (!this.gameObject.isDestroyed && !this.gameObject.isCrashing && this.renderableManager) {
              var e = this.objMoveTrait?.lastTeleportTick,
                i = e !== this.lastTeleport;
              let t = this.gameObject.warpedOutTrait.isActive();
              (t !== this.lastWarpedOut || i) &&
                ((this.lastTeleport = e),
                (this.lastWarpedOut = t) || i
                  ? (this.chronoSparkleAnim?.endAnimationLoop(),
                    (this.chronoSparkleAnim = this.renderableManager.createTransientAnim(this.sparkleAnimName, (e) => {
                      ((e.extraOffset = { x: 0, y: r.Coords.ISO_TILE_SIZE / 2 }),
                        e.setPosition(this.gameObject.position.worldPosition.clone()),
                        e.create3DObject(),
                        (e.getAnimProps().loopCount = t ? -1 : 1));
                    })))
                  : t || this.chronoSparkleAnim?.endAnimationLoop());
            }
          }
          onRemove() {
            ((this.renderableManager = void 0), this.chronoSparkleAnim?.endAnimationLoop());
          }
          dispose() {}
        }),
      );
    },
  };
});
