// === Reconstructed SystemJS module: engine/renderable/fx/handler/ChronoFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","game/Coords","game/gameobject/common/DeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/ChronoFxHandler",
  ["game/event/EventType", "util/disposable/CompositeDisposable", "game/Coords", "game/gameobject/common/DeathType"],
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
          "ChronoFxHandler",
          (n = class {
            constructor(e, t) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.disposables = new r.CompositeDisposable()),
                (this.handleObjectTeleport = (r) => {
                  if (r.isChronoshift) {
                    let i = r.target.position.getTileOffset().multiplyScalar(1 / s.Coords.LEPTONS_PER_TILE);
                    (this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpOut, (e) => {
                      e.setPosition(s.Coords.tile3dToWorld(r.prevTile.rx + i.x, r.prevTile.ry + i.y, r.prevTile.z));
                    }),
                      this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpOut, (e) => {
                        var t = r.target.tile;
                        e.setPosition(s.Coords.tile3dToWorld(t.rx + i.x, t.ry + i.y, t.z));
                      }));
                  }
                }),
                (this.handleObjectDestroy = (e) => {
                  if (e.target.deathType === a.DeathType.Temporal) {
                    let t = e.target.isBuilding() ? e.target.centerTile : e.target.tile,
                      i = e.target.isBuilding()
                        ? new THREE.Vector2(0.5, 0.5)
                        : e.target.position.getTileOffset().multiplyScalar(1 / s.Coords.LEPTONS_PER_TILE);
                    this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpAway, (e) => {
                      e.setPosition(s.Coords.tile3dToWorld(t.rx + i.x, t.ry + i.y, t.z));
                    });
                  }
                }));
            }
            init() {
              this.disposables.add(
                this.game.events.subscribe(i.EventType.ObjectTeleport, this.handleObjectTeleport),
                this.game.events.subscribe(i.EventType.ObjectDestroy, this.handleObjectDestroy),
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
