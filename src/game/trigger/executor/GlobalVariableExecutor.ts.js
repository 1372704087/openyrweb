// === Reconstructed SystemJS module: game/trigger/executor/GlobalVariableExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/GlobalVariableExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          (super(e, t), (this.value = i), (this.variableIdx = Number(e.params[1])));
        }
        execute(e) {
          e.triggers.toggleGlobalVariable(this.variableIdx, this.value);
        }
      }),
        e("GlobalVariableExecutor", r));
    },
  };
});
