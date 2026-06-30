// === Reconstructed SystemJS module: game/gameobject/task/morph/UndeployIntoTask ===
// deps: ["game/gameobject/task/morph/MorphIntoTask","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/morph/UndeployIntoTask",
  ["game/gameobject/task/morph/MorphIntoTask", "engine/type/ObjectType"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends i.MorphIntoTask {
          onStart(e) {
            var t = e.rules.undeploysInto;
            if (!t) throw new Error(`Object type "${e.name}" doesn't undeploy into anything`);
            ((this.morphInto = this.game.rules.getObject(t, r.ObjectType.Vehicle)), super.onStart(e));
          }
        }),
          e("UndeployIntoTask", s));
      },
    };
  },
);
