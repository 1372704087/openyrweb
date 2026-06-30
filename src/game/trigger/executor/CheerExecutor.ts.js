// === Reconstructed SystemJS module: game/trigger/executor/CheerExecutor ===
// deps: ["engine/type/ObjectType","game/gameobject/task/CheerTask","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/CheerExecutor",
  ["engine/type/ObjectType", "game/gameobject/task/CheerTask", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var r, s, i, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((a = class extends i.TriggerExecutor {
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(e.params[1])));
          }
          execute(e) {
            let t = e.getAllPlayers().filter((e) => e.country && !e.defeated);
            if ((-1 !== this.houseId && (t = t.filter((e) => e.country?.id === this.houseId)), t.length))
              for (var i of t[0].getOwnedObjectsByType(r.ObjectType.Infantry))
                i.unitOrderTrait.isIdle() && i.unitOrderTrait.addTask(new s.CheerTask());
          }
        }),
          e("CheerExecutor", a));
      },
    };
  },
);
