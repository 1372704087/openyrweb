// === Reconstructed SystemJS module: game/trigger/condition/AnyEventCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/AnyEventCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
        check(e) {
          return !0;
        }
      }),
        e("AnyEventCondition", r));
    },
  };
});
