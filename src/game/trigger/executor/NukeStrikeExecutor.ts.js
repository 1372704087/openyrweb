// === Reconstructed SystemJS module: game/trigger/executor/NukeStrikeExecutor ===
// deps: ["game/trait/SuperWeaponsTrait","game/type/SuperWeaponType","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/NukeStrikeExecutor",
  ["game/trait/SuperWeaponsTrait", "game/type/SuperWeaponType", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var a, n, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(e) {
            var t,
              i,
              r = this.action.params[6],
              s = e.map.getTileAtWaypoint(r);
            s
              ? !(t = e.getAllPlayers().find((e) => !e.defeated && e.country?.name === this.trigger.houseName)) ||
                ((i = [...e.rules.superWeaponRules.values()].find((e) => e.type === n.SuperWeaponType.MultiMissile)) &&
                  e.traits.get(a.SuperWeaponsTrait).activateEffect(i, t, e, s, void 0, !0))
              : console.warn(`No valid location found for waypoint ${r}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("NukeStrikeExecutor", r));
      },
    };
  },
);
