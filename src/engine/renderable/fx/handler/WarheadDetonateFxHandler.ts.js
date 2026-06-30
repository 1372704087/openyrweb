// === Reconstructed SystemJS module: engine/renderable/fx/handler/WarheadDetonateFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","game/Coords","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/WarheadDetonateFxHandler",
  ["game/event/EventType", "util/disposable/CompositeDisposable", "game/Coords", "util/math"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "WarheadDetonateFxHandler",
          (n = class {
            constructor(e, t) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.disposables = new r.CompositeDisposable()),
                (this.handleWarheadDetonation = (r) => {
                  var e = r.explodeAnim;
                  (e &&
                    this.renderableManager.createTransientAnim(e, (e) => {
                      let t = r.position.clone();
                      var i;
                      (r.target.rules.bullets &&
                        ((i = s.Coords.getWorldTileSize() / 8),
                        (t = new THREE.Vector3(a.getRandomInt(-i, i), 0, a.getRandomInt(-i, i)).add(t))),
                        e.setPosition(t));
                    }),
                    r.isLightningStrike &&
                      ((e = (e = this.game.rules.audioVisual.weatherConBolts)[a.getRandomInt(0, e.length - 1)]),
                      this.renderableManager.createTransientAnim(e, (e) => {
                        e.setPosition(r.position);
                      })));
                }));
            }
            init() {
              this.disposables.add(
                this.game.events.subscribe(i.EventType.WarheadDetonate, this.handleWarheadDetonation),
              );
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
