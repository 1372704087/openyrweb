// === Reconstructed SystemJS module: game/player/PlayerFactory ===
// deps: ["game/Player","game/Country","game/player/trait/PowerTrait","game/player/trait/RadarTrait","game/player/production/Production","game/SideType","game/player/trait/SuperWeaponsTrait","game/player/trait/SharedDetectDisguiseTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/player/PlayerFactory",
  [
    "game/Player",
    "game/Country",
    "game/player/trait/PowerTrait",
    "game/player/trait/RadarTrait",
    "game/player/production/Production",
    "game/SideType",
    "game/player/trait/SuperWeaponsTrait",
    "game/player/trait/SharedDetectDisguiseTrait",
  ],
  function (e, t) {
    "use strict";
    var o, s, l, c, h, a, u, d, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        e(
          "PlayerFactory",
          (i = class {
            constructor(e, t, i) {
              ((this.rules = e), (this.gameOpts = t), (this.allAvailableObjects = i));
            }
            createCombatant(e, t, i, r, s, a) {
              let n = new o.Player(e, t, i, r);
              return (
                (n.isAi = s),
                (n.aiDifficulty = a),
                (n.powerTrait = new l.PowerTrait(n)),
                n.traits.add(n.powerTrait),
                (n.radarTrait = new c.RadarTrait()),
                n.traits.add(n.radarTrait),
                (n.superWeaponsTrait = new u.SuperWeaponsTrait()),
                n.traits.add(n.superWeaponsTrait),
                (n.production = h.Production.factory(n, this.rules, this.gameOpts, this.allAvailableObjects)),
                (n.sharedDetectDisguiseTrait = new d.SharedDetectDisguiseTrait()),
                n
              );
            }
            createObserver(e, t) {
              let i = new o.Player(e, void 0, void 0, t.colors.get("LightGrey"));
              return ((i.radarTrait = new c.RadarTrait()), i.traits.add(i.radarTrait), i.radarTrait.setDisabled(!1), i);
            }
            createNeutral(e, t) {
              var i = [...e.countryRules.values()].find((e) => e.side === a.SideType.Civilian);
              if (!i) throw new Error("Missing neutral country. No country found in rules with Civilian side");
              i = new s.Country(i);
              let r = new o.Player(t, i, void 0, e.colors.get("LightGrey"));
              return ((r.powerTrait = new l.PowerTrait(r)), r.traits.add(r.powerTrait), r);
            }
          }),
        );
      },
    };
  },
);
