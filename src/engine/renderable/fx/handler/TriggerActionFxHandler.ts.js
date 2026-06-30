// === Reconstructed SystemJS module: engine/renderable/fx/handler/TriggerActionFxHandler ===
// deps: ["util/disposable/CompositeDisposable","game/Coords","game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/TriggerActionFxHandler",
  ["util/disposable/CompositeDisposable", "game/Coords", "game/event/EventType"],
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
          "TriggerActionFxHandler",
          (a = class {
            constructor(e, t) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.disposables = new i.CompositeDisposable()),
                (this.handleEvent = (e) => {
                  switch (e.type) {
                    case s.EventType.TriggerAnim: {
                      let i = e;
                      var t = i.name;
                      this.renderableManager.createTransientAnim(t, (e) => {
                        var t = r.Coords.tile3dToWorld(i.tile.rx + 0.5, i.tile.ry + 0.5, i.tile.z);
                        e.setPosition(t);
                      });
                      break;
                    }
                  }
                }));
            }
            init() {
              this.disposables.add(this.game.events.subscribe(this.handleEvent));
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
