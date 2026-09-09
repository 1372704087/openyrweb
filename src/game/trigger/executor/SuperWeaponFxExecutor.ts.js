// === OpenYRWeb: 超武特效触发动作 (SuperWeaponFxExecutor) ===
// 处理多个按路径点目标施放超武的动作：
//   58  MeteorStrike    → MultiMissile
//   84  ChronoWarp     → ChronoWarp
//   114 ChronoshiftAt  → ChronoSphere
//   115 ChronoWarpAt   → ChronoWarp
//   117 PsychicRevealAt→ PsychicReveal
//   118 GeneticMutatorAt → GeneticMutator
// 参考 NukeStrikeExecutor：激活触发 house 的对应超武效果（tile = 路径点）。
// deps: ["game/trait/SuperWeaponsTrait","game/type/SuperWeaponType","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/SuperWeaponFxExecutor",
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
        var SUPER_WEAPON_BY_MODE = {
          meteor: n.SuperWeaponType.MultiMissile,
          chronowarp: n.SuperWeaponType.ChronoWarp,
          chronoshift: n.SuperWeaponType.ChronoSphere,
          chronowarpat: n.SuperWeaponType.ChronoWarp,
          psychic: n.SuperWeaponType.PsychicReveal,
          genetic: n.SuperWeaponType.GeneticMutator,
        };
        ((r = class extends i.TriggerExecutor {
          constructor(e, t, s) {
            (super(e, t), (this.mode = s));
          }
          execute(e) {
            var t = this.action.params[6],
              s = e.map.getTileAtWaypoint(t);
            if (!s) {
              console.warn(`No valid location found for waypoint ${t}. Skipping action ${this.getDebugName()}.`);
              return;
            }
            var h = SUPER_WEAPON_BY_MODE[this.mode];
            if (void 0 === h) {
              console.warn(`Unknown super weapon fx mode "${this.mode}" for ${this.getDebugName()}.`);
              return;
            }
            var p =
              e.housePlayers.get(this.trigger.houseName) ||
              e.getAllPlayers().find((p) => !p.defeated && p.country?.name === this.trigger.houseName);
            if (!p) {
              console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
              return;
            }
            var sw = [...e.rules.superWeaponRules.values()].find((s) => s.type === h);
            if (!sw) {
              console.warn(`Super weapon type ${h} not found in rules. Skipping ${this.getDebugName()}.`);
              return;
            }
            // ChronoSphere 需要 tile2 参数（用目标点自身近似）；其余单点施放。
            var tile2 = h === n.SuperWeaponType.ChronoSphere ? s : void 0;
            e.traits.get(a.SuperWeaponsTrait).activateEffect(sw, p, e, s, tile2, !0);
            console.warn(`[OpenYRWeb] SuperWeaponFx ${this.mode}: ${p.name} @ waypoint ${t}`);
          }
        }),
          e("SuperWeaponFxExecutor", r));
      },
    };
  },
);
