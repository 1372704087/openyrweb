// === Reconstructed SystemJS module: game/trigger/condition/GlobalVariableCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/GlobalVariableCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
      ((r = class extends i.TriggerCondition {
        constructor(e, t, i) {
          (super(e, t), (this.value = i), (this.blocking = !0), (this.variableIdx = Number(e.params[1])));
        }
        check(e) {
          return e.triggers.getGlobalVariable(this.variableIdx) === this.value;
        }
      }),
        e("GlobalVariableCondition", r));
    },
  };
});
