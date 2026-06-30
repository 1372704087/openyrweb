// === Reconstructed SystemJS module: engine/renderable/entity/building/AnimationType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/building/AnimationType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("AnimationType", (i = {})))[(e.IDLE = 0)] = "IDLE"),
        (e[(e.PRODUCTION = 1)] = "PRODUCTION"),
        (e[(e.ACTIVE = 2)] = "ACTIVE"),
        (e[(e.SPECIAL = 3)] = "SPECIAL"),
        (e[(e.SUPER = 4)] = "SUPER"),
        (e[(e.BUILDUP = 5)] = "BUILDUP"),
        (e[(e.UNBUILD = 6)] = "UNBUILD"),
        (e[(e.FACTORY_DEPLOYING = 7)] = "FACTORY_DEPLOYING"),
        (e[(e.FACTORY_ROOF_DEPLOYING = 8)] = "FACTORY_ROOF_DEPLOYING"),
        (e[(e.SUPER_IDLE = 9)] = "SUPER_IDLE"),
        (e[(e.SUPER_CHARGE_START = 10)] = "SUPER_CHARGE_START"),
        (e[(e.SUPER_CHARGE_LOOP = 11)] = "SUPER_CHARGE_LOOP"),
        (e[(e.SUPER_CHARGE_END = 12)] = "SUPER_CHARGE_END"),
        (e[(e.SPECIAL_DOCKING = 13)] = "SPECIAL_DOCKING"),
        (e[(e.SPECIAL_REPAIR_START = 14)] = "SPECIAL_REPAIR_START"),
        (e[(e.SPECIAL_REPAIR_LOOP = 15)] = "SPECIAL_REPAIR_LOOP"),
        (e[(e.SPECIAL_REPAIR_END = 16)] = "SPECIAL_REPAIR_END"),
        (e[(e.SPECIAL_SHOOT = 17)] = "SPECIAL_SHOOT"),
        (e[(e.FACTORY_UNDER_DOOR = 18)] = "FACTORY_UNDER_DOOR"),
        (e[(e.FACTORY_UNDER_ROOF_DOOR = 19)] = "FACTORY_UNDER_ROOF_DOOR"));
    },
  };
});
