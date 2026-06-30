// === Reconstructed SystemJS module: game/superweapon/SuperWeaponEffect ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/superweapon/SuperWeaponEffect", [], function (t, e) {
  "use strict";
  var r, i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = r || t("EffectStatus", (r = {})))[(e.NotStarted = 0)] = "NotStarted"),
        (e[(e.Running = 1)] = "Running"),
        (e[(e.Finished = 2)] = "Finished"),
        t(
          "SuperWeaponEffect",
          (i = class {
            constructor(e, t, i) {
              ((this.type = e), (this.owner = t), (this.tile = i), (this.status = r.NotStarted));
            }
            onStart(e) {}
            onTick(e) {
              return !0;
            }
          }),
        ));
    },
  };
});
