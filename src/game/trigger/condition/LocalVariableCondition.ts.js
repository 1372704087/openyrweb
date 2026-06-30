// === Reconstructed SystemJS module: game/trigger/condition/LocalVariableCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/LocalVariableCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
          return e.triggers.getLocalVariable(this.variableIdx) === this.value;
        }
      }),
        e("LocalVariableCondition", r));
    },
  };
});
