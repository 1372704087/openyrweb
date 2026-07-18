// === Reconstructed SystemJS module: engine/renderable/entity/plugin/TrailerSmokePlugin ===
// deps: ["engine/renderable/fx/TrailerSmokeFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/TrailerSmokePlugin",
  ["engine/renderable/fx/TrailerSmokeFx"],
  function (e, t) {
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
          "TrailerSmokePlugin",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.gameObject = e), (this.art = t), (this.theater = i), (this.imageFinder = r), (this.gameSpeed = s));
            }
            onCreate(e) {
              ((this.initialPosition = this.gameObject.position.worldPosition.clone()), (this.renderableManager = e));
            }
            update(e) {
              if (
                this.renderableManager &&
                !this.trailerFx &&
                !this.gameObject.position.worldPosition.equals(this.initialPosition)
              ) {
                if (this.gameObject.isAircraft()) {
                  let e;
                  (this.gameObject.rules.missileSpawn
                    ? (e = this.art.getAnimation(this.gameObject.art.trailer || "V3TRAIL"))
                    : this.gameObject.isCrashing && (e = this.art.getAnimation("SGRYSMK1")),
                    e &&
                      ((i = this.imageFinder.findByObjectArt(e)),
                      (r = this.theater.getPalette(e.paletteType)),
                      (t = this.gameObject.art.spawnDelay),
                      (this.trailerFx = new a.TrailerSmokeFx(
                        this.gameObject.position.worldPosition,
                        t,
                        e,
                        i,
                        r,
                        this.gameSpeed,
                      )),
                      this.renderableManager.addEffect(this.trailerFx)));
                }
                var t, i, r, s;
                (!this.gameObject.isProjectile() && !this.gameObject.isDebris()) ||
                  ((s = this.gameObject.isProjectile()
                    ? this.gameObject.art.trailer
                    : this.gameObject.rules.trailerAnim) &&
                    ((t = this.art.getAnimation(s)),
                    (i = this.imageFinder.findByObjectArt(t)),
                    (r = this.theater.getPalette(t.paletteType)),
                    (s = this.gameObject.isProjectile()
                      ? this.gameObject.art.spawnDelay
                      : this.gameObject.rules.trailerSeparation),
                    (this.trailerFx = new a.TrailerSmokeFx(
                      this.gameObject.position.worldPosition,
                      s,
                      t,
                      i,
                      r,
                      this.gameSpeed,
                    )),
                    this.renderableManager.addEffect(this.trailerFx)));
              }
            }
            onRemove(e) {
              ((this.renderableManager = void 0), this.trailerFx?.finishAndRemove());
            }
            dispose() {
              this.trailerFx?.finishAndRemove();
            }
          }),
        );
      },
    };
  },
);
