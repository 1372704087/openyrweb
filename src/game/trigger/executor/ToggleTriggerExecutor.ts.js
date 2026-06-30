// === Reconstructed SystemJS module: game/trigger/executor/ToggleTriggerExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ToggleTriggerExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.TriggerExecutor {
        constructor(e, t, i) {
          (super(e, t), (this.triggerEnable = i));
        }
        execute(e) {
          var t = this.action.params[1];
          e.triggers.setTriggerEnabled(t, this.triggerEnable);
        }
      }),
        e("ToggleTriggerExecutor", r));
    },
  };
});
