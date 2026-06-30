// === Reconstructed SystemJS module: engine/renderable/entity/plugin/DamageSmokePlugin ===
// deps: ["engine/renderable/fx/DamageSmokeFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/DamageSmokePlugin",
  ["engine/renderable/fx/DamageSmokeFx"],
  function (e, t) {
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
          "DamageSmokePlugin",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.gameObject = e), (this.art = t), (this.theater = i), (this.imageFinder = r), (this.gameSpeed = s));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(e) {
              var t, i, r;
              this.renderableManager &&
                ((r = this.gameObject.healthTrait.health < 50) === this.lastDamaged ||
                  this.gameObject.isDestroyed ||
                  ((this.lastDamaged = r)
                    ? this.smokeFx ||
                      ((this.smokeStartTime = e),
                      (t = this.art.getAnimation("SGRYSMK1")) &&
                        ((i = this.imageFinder.findByObjectArt(t)),
                        (r = this.theater.getPalette(t.paletteType)),
                        (this.smokeFx = new s.DamageSmokeFx(this.gameObject, t, i, r, this.gameSpeed)),
                        this.renderableManager.addEffect(this.smokeFx)))
                    : this.disposeSmokeFx()),
                this.smokeFx &&
                  this.smokeStartTime &&
                  e - this.smokeStartTime >= 8e4 / this.gameSpeed.value &&
                  this.disposeSmokeFx());
            }
            disposeSmokeFx() {
              this.smokeFx && (this.smokeFx.finishAndRemove(), (this.smokeFx = void 0));
            }
            onRemove(e) {
              ((this.renderableManager = void 0), this.disposeSmokeFx());
            }
            dispose() {
              this.disposeSmokeFx();
            }
          }),
        );
      },
    };
  },
);
