// === Reconstructed SystemJS module: engine/renderable/entity/plugin/MoveSoundFxPlugin ===
// deps: ["game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/MoveSoundFxPlugin",
  ["game/gameobject/unit/ZoneType"],
  function (e, t) {
    "use strict";
    var i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "MoveSoundFxPlugin",
          (r = class {
            constructor(e, t, i) {
              ((this.gameObject = e), (this.moveSound = t), (this.worldSound = i), (this.lastMovingOrRotating = !1));
            }
            onCreate() {}
            update() {
              var e;
              this.gameObject.isDestroyed ||
                this.gameObject.isCrashing ||
                ((e =
                  !this.gameObject.warpedOutTrait.isActive() &&
                  !!(
                    (!this.gameObject.rules.balloonHover &&
                      this.gameObject.rules.hoverAttack &&
                      this.gameObject.zone === i.ZoneType.Air) ||
                    this.gameObject.spinVelocity ||
                    (!this.gameObject.moveTrait.isIdle() && !this.gameObject.moveTrait.isWaiting())
                  )) !== this.lastMovingOrRotating &&
                  ((this.lastMovingOrRotating = e)
                    ? (this.soundHandle && this.soundHandle.isPlaying()) ||
                      (this.soundHandle = this.worldSound.playEffect(
                        this.moveSound,
                        this.gameObject,
                        this.gameObject.owner,
                        0.35,
                      ))
                    : this.soundHandle?.isLoop && (this.soundHandle.stop(), (this.soundHandle = void 0))));
            }
            onRemove() {
              this.soundHandle?.stop();
            }
            dispose() {
              this.soundHandle?.stop();
            }
          }),
        );
      },
    };
  },
);
