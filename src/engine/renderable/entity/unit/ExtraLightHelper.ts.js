// === Reconstructed SystemJS module: engine/renderable/entity/unit/ExtraLightHelper ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/unit/ExtraLightHelper", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ExtraLightHelper",
        (i = class {
          static multiplyShp(e, t, i) {
            e.copy(t).add(t.clone().addScalar(1).multiplyScalar(i));
          }
          static multiplyVxl(e, t, i, r) {
            e.copy(t).addScalar(2 * r * i);
          }
        }),
      );
    },
  };
});
