// === Reconstructed SystemJS module: game/gameobject/task/system/TargetLinesConfig ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/TargetLinesConfig", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e("cloneConfig", (e) => (e ? { ...e } : void 0)),
        e(
          "configsAreEqual",
          (e, t) =>
            (!e && !t) || (e?.isAttack === t?.isAttack && e?.pathNodes === t?.pathNodes && e?.target === t?.target),
        ),
        e("configHasTarget", (e) => !(!e?.pathNodes.length && !e?.target)));
    },
  };
});
