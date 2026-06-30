// === Reconstructed SystemJS module: game/trigger/executor/CreateCrateExecutor ===
// deps: ["game/type/PowerupType","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/CreateCrateExecutor",
  ["game/type/PowerupType", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var i, r, n, s;
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
        ((n = new Map([
          [
            0,
            (e) => {
              var t = e.rules.powerups.powerups.find((e) => e.type === i.PowerupType.Money);
              return t ? { ...t, data: "5000" } : void 0;
            },
          ],
          [1, i.PowerupType.Unit],
          [2, i.PowerupType.HealBase],
          [3, i.PowerupType.Cloak],
          [4, i.PowerupType.Explosion],
          [5, i.PowerupType.Napalm],
          [6, i.PowerupType.Money],
          [7, i.PowerupType.Darkness],
          [8, i.PowerupType.Reveal],
          [9, i.PowerupType.Armor],
          [10, i.PowerupType.Speed],
          [11, i.PowerupType.Firepower],
          [12, i.PowerupType.ICBM],
          [13, void 0],
          [14, i.PowerupType.Veteran],
          [15, void 0],
          [16, i.PowerupType.Gas],
          [17, i.PowerupType.Tiberium],
          [18, void 0],
        ])),
          (s = class extends r.TriggerExecutor {
            execute(e) {
              var t = Number(this.action.params[1]),
                i = this.action.params[6],
                r = e.gameOpts.cratesAppear,
                s = e.map.getTileAtWaypoint(i);
              if (s)
                if (n.has(t)) {
                  const a = n.get(t);
                  t = "function" == typeof a ? a(e) : e.rules.powerups.powerups.find((e) => e.type === a);
                  t && e.crateGeneratorTrait.spawnCrateAt(s, t, e, 3, r);
                } else e.crateGeneratorTrait.spawnRandomCrateAt(s, e, 3, r);
              else
                console.warn(`No valid location found for waypoint ${i}. ` + `Skipping action ${this.getDebugName()}.`);
            }
          }),
          e("CreateCrateExecutor", s));
      },
    };
  },
);
