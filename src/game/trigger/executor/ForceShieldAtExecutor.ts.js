// === OpenYRWeb: 力场盾动作 (ForceShieldAtExecutor) ===
// 动作 112: ForceShieldAt — 在指定路径点对触发阵营施加力场盾效果。
// 复用超级武器通道 SuperWeaponsTrait.activateEffect(ForceShield)。
// 参数: params[6] = 路径点编号(AZ 编码)。
// deps: ["game/trait/SuperWeaponsTrait","game/type/SuperWeaponType","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/ForceShieldAtExecutor",
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
                ((i = [...e.rules.superWeaponRules.values()].find((e) => e.type === n.SuperWeaponType.ForceShield)) &&
                  e.traits.get(a.SuperWeaponsTrait).activateEffect(i, t, e, s, void 0, !0))
              : console.warn(`No valid location found for waypoint ${r}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("ForceShieldAtExecutor", r));
      },
    };
  },
);
