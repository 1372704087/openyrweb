// === Reconstructed SystemJS module: game/trigger/executor/AddSuperWeaponExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/AddSuperWeaponExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          (super(e, t), (this.oneTimeOnly = i), (this.superWeaponIdx = Number(e.params[1])));
        }
        execute(i) {
          var r = [...i.rules.superWeaponRules.values()].find((e) => e.index === this.superWeaponIdx);
          if (r) {
            let t = i.getAllPlayers().find((e) => e.country?.name === this.trigger.houseName);
            if (t && t.superWeaponsTrait && !t.superWeaponsTrait.has(r.name)) {
              let e = i.createSuperWeapon(r.name, t, this.oneTimeOnly);
              ((e.isGift = !0), t.superWeaponsTrait.add(e));
            }
          } else
            console.warn(
              `No superweapon found with index "${this.superWeaponIdx}". ` + `Skipping action ${this.getDebugName()}.`,
            );
        }
      }),
        e("AddSuperWeaponExecutor", r));
    },
  };
});
