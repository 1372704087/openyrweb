// === Reconstructed SystemJS module: game/gameobject/trait/AgentTrait ===
// deps: ["game/rules/TechnoRules","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/trait/AgentTrait", ["game/rules/TechnoRules", "util/math"], function (e, t) {
  "use strict";
  var a, n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "AgentTrait",
        (i = class {
          infiltrate(e, t, i) {
            var r, s;
            (t.rules.radar &&
              ![...t.owner.buildings].some((e) => e.rules.spySat) &&
              i.mapShroudTrait.resetShroud(t.owner, i),
              0 < t.rules.power && ((r = i.rules.general.spyPowerBlackout), t.owner.powerTrait?.setBlackoutFor(r, i)),
              t.superWeaponTrait && t.superWeaponTrait.getSuperWeapon(t)?.resetTimer(),
              0 < t.rules.storage &&
                ((s = n.clamp(i.rules.general.spyMoneyStealPercent, 0, 1)),
                (s = Math.floor(t.owner.credits * s)),
                (t.owner.credits -= s),
                (e.owner.credits += s)),
              !i.rules.ai.buildTech.includes(t.name) ||
                (void 0 !== (s = t.rules.aiBasePlanningSide) && e.owner.production.addStolenTech(s)),
              t.factoryTrait &&
                [a.FactoryType.InfantryType, a.FactoryType.UnitType].includes(t.factoryTrait.type) &&
                e.owner.production?.addVeteranType(t.factoryTrait.type));
          }
        }),
      );
    },
  };
});
