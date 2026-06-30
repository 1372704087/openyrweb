// === Reconstructed SystemJS module: game/trigger/condition/CreditsExceedCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/CreditsExceedCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
        constructor(e, t) {
          (super(e, t), (this.threshold = Number(e.params[1])));
        }
        check(e, t) {
          return !!this.player && this.player.credits > this.threshold;
        }
      }),
        e("CreditsExceedCondition", r));
    },
  };
});
