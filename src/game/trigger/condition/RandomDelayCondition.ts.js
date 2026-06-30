// === Reconstructed SystemJS module: game/trigger/condition/RandomDelayCondition ===
// deps: ["game/GameSpeed","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/RandomDelayCondition",
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
          constructor() {
            (super(...arguments), (this.elapsedTicks = 0));
          }
          check(e) {
            return (
              this.timerTicks ??
                (this.timerTicks =
                  Math.floor((e.generateRandomInt(50, 150) / 100) * Number(this.event.params[1])) *
                  i.GameSpeed.BASE_TICKS_PER_SECOND),
              this.elapsedTicks++ > this.timerTicks
            );
          }
          reset() {
            ((this.timerTicks = void 0), (this.elapsedTicks = 0));
          }
        }),
          e("RandomDelayCondition", s));
      },
    };
  },
);
