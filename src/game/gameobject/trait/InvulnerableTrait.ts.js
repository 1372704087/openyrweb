// === Reconstructed SystemJS module: game/gameobject/trait/InvulnerableTrait ===
// deps: ["game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/InvulnerableTrait",
  ["game/gameobject/unit/Timer", "game/gameobject/trait/interface/NotifyTick"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class {
          constructor() {
            this.timer = new i.Timer();
          }
          isActive() {
            return this.timer.isActive();
          }
          setActiveFor(e, t) {
            this.timer.setActiveFor(e, t);
          }
          [r.NotifyTick.onTick](e, t) {
            this.timer.tick(t.currentTick);
          }
        }),
          e("InvulnerableTrait", s));
      },
    };
  },
);
