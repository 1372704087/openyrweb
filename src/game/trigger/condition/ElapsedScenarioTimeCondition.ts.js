// === Reconstructed SystemJS module: game/trigger/condition/ElapsedScenarioTimeCondition ===
// deps: ["game/GameSpeed","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/ElapsedScenarioTimeCondition",
  ["game/GameSpeed", "game/trigger/TriggerCondition"],
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
        ((s = class extends r.TriggerCondition {
          constructor(e, t) {
            (super(e, t), (this.timerTicks = Number(this.event.params[1]) * i.GameSpeed.BASE_TICKS_PER_SECOND));
          }
          check(e) {
            return e.currentTick > this.timerTicks;
          }
        }),
          e("ElapsedScenarioTimeCondition", s));
      },
    };
  },
);
