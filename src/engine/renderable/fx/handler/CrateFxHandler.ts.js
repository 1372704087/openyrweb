// === Reconstructed SystemJS module: engine/renderable/fx/handler/CrateFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/CrateFxHandler",
  ["game/event/EventType", "util/disposable/CompositeDisposable", "game/Coords"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        e(
          "CrateFxHandler",
          (a = class {
            constructor(e, t) {
              ((this.game = e), (this.renderableManager = t), (this.disposables = new r.CompositeDisposable()));
            }
            init() {
              this.disposables.add(
                this.game.events.subscribe(i.EventType.CratePickup, (t) => {
                  var e = t.target.animName;
                  e &&
                    this.renderableManager.createTransientAnim(e, (e) => {
                      (e.setPosition(s.Coords.tile3dToWorld(t.tile.rx, t.tile.ry, t.tile.z + 1)),
                        e.setRenderOrder(1e6));
                    });
                }),
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
