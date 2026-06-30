// === Reconstructed SystemJS module: engine/renderable/entity/building/DamageType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/building/DamageType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("DamageType", (i = {})))[(e.NORMAL = 0)] = "NORMAL"),
        (e[(e.CONDITION_YELLOW = 1)] = "CONDITION_YELLOW"),
        (e[(e.CONDITION_RED = 2)] = "CONDITION_RED"),
        (e[(e.DESTROYED = 3)] = "DESTROYED"));
    },
  };
});
