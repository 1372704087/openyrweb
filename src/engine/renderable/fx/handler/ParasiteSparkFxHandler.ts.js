// === Reconstructed SystemJS module: engine/renderable/fx/handler/ParasiteSparkFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","game/Coords","game/GameSpeed","engine/renderable/fx/SparkFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/ParasiteSparkFxHandler",
  [
    "game/event/EventType",
    "util/disposable/CompositeDisposable",
    "game/Coords",
    "game/GameSpeed",
    "engine/renderable/fx/SparkFx",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "ParasiteSparkFxHandler",
          (o = class {
            constructor(e, t) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.disposables = new r.CompositeDisposable()),
                (this.handleObjectDamaged = (t) => {
                  if (
                    (t.target.isVehicle() || t.target.isAircraft()) &&
                    t.attacker?.obj &&
                    !t.attacker.obj.rules.organic &&
                    (t.target.parasiteableTrait?.getParasite() === t.attacker.obj || t.target === t.attacker.obj) &&
                    0 < t.target.healthTrait.health
                  ) {
                    let e = t.target.position.worldPosition.clone();
                    e.y += s.Coords.tileHeightToWorld(0.5);
                    var i = 20 / a.GameSpeed.BASE_TICKS_PER_SECOND,
                      i = new n.SparkFx(e, new THREE.Color(1, 1, 1), i, this.game.speed);
                    this.renderableManager.addEffect(i);
                  }
                }));
            }
            init() {
              this.disposables.add(this.game.events.subscribe(i.EventType.InflictDamage, this.handleObjectDamaged));
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
