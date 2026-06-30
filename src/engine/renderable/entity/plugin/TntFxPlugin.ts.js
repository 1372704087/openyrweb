// === Reconstructed SystemJS module: engine/renderable/entity/plugin/TntFxPlugin ===
// deps: ["engine/type/ObjectType","engine/sound/SoundKey"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/TntFxPlugin",
  ["engine/type/ObjectType", "engine/sound/SoundKey"],
  function (e, t) {
    "use strict";
    var i, a, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "TntFxPlugin",
          (r = class {
            constructor(e, t, i, r, s, a, n, o, l, c) {
              ((this.gameObject = e),
                (this.tntChargeTrait = t),
                (this.frameDurationTicks = i),
                (this.renderable = r),
                (this.imageFinder = s),
                (this.art = a),
                (this.alliances = n),
                (this.viewer = o),
                (this.worldSound = l),
                (this.animFactory = c),
                (this.lastHasCharge = !1));
            }
            onCreate() {
              this.animStepCount = Math.floor(
                this.imageFinder.findByObjectArt(this.art.getObject("BOMBCURS", i.ObjectType.Animation)).numImages / 2,
              );
            }
            update(e) {
              if (this.gameObject.isDestroyed || this.gameObject.isCrashing)
                this.gameObject.rules.leaveRubble && (this.disposeBombAnim(), this.soundHandle?.stop());
              else {
                var t = this.tntChargeTrait.hasCharge(),
                  r = t !== this.lastHasCharge;
                let i;
                i = t
                  ? ((s = 1 - this.tntChargeTrait.getTicksLeft() / this.tntChargeTrait.getInitialTicks()),
                    Math.floor(2 * s * (this.animStepCount - 1)))
                  : 0;
                var s = i !== this.lastStartFrame;
                if ((this.bombAnim?.update(e), r || s))
                  if (((this.lastHasCharge = t), (this.lastStartFrame = i), t)) {
                    (r &&
                      (this.soundHandle?.stop(),
                      (this.soundHandle = this.worldSound?.playEffect(a.SoundKey.BombTickingSound, this.gameObject))),
                      this.disposeBombAnim());
                    r = this.gameObject.tntChargeTrait.getChargeOwner();
                    if (!this.viewer.value || this.alliances.haveSharedIntel(r, this.viewer.value)) {
                      let e = (this.bombAnim = this.animFactory("BOMBCURS"));
                      (e.setRenderOrder(999995), e.create3DObject());
                      let t = e.getAnimProps();
                      ((t.loopCount = -1),
                        (t.start = t.loopStart = i),
                        (t.end = i + 2 - 1),
                        (t.loopEnd = t.end),
                        (t.rate /= this.frameDurationTicks),
                        this.renderable.get3DObject()?.add(e.get3DObject()));
                    }
                  } else (this.disposeBombAnim(), this.soundHandle?.stop());
              }
            }
            disposeBombAnim() {
              (this.bombAnim?.get3DObject() && this.renderable.get3DObject()?.remove(this.bombAnim.get3DObject()),
                this.bombAnim?.dispose());
            }
            onRemove() {
              (this.disposeBombAnim(), this.soundHandle?.stop());
            }
            dispose() {
              (this.disposeBombAnim(), this.soundHandle?.stop());
            }
          }),
        );
      },
    };
  },
);
