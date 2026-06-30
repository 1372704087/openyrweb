// === Reconstructed SystemJS module: game/trigger/TriggerCondition ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/TriggerCondition", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "TriggerCondition",
        (i = class {
          constructor(e, t) {
            ((this.event = e), (this.trigger = t), (this.blocking = !1), (this.targets = []));
          }
          init(e) {
            var t = e.getAllPlayers().find((e) => e.country?.name === this.trigger.houseName);
            t && (this.player = t);
          }
          setTargets(e) {
            this.targets = e;
          }
          reset() {}
          getDebugName() {
            return `${this.event.triggerId}[${this.event.eventIndex}] (${this.trigger.name}).`;
          }
        }),
      );
    },
  };
});
