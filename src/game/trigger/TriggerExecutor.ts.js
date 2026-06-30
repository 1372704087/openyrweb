// === Reconstructed SystemJS module: game/trigger/TriggerExecutor ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/TriggerExecutor", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "TriggerExecutor",
        (i = class {
          constructor(e, t) {
            ((this.action = e), (this.trigger = t));
          }
          getDebugName() {
            return `${this.action.triggerId}[${this.action.index}] (${this.trigger.name}).`;
          }
        }),
      );
    },
  };
});
