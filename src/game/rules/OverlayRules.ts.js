// === Reconstructed SystemJS module: game/rules/OverlayRules ===
// deps: ["game/type/LandType","game/rules/ObjectRules","game/type/ArmorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/rules/OverlayRules",
  ["game/type/LandType", "game/rules/ObjectRules", "game/type/ArmorType"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class extends r.ObjectRules {
          parse() {
            (super.parse(),
              (this.armor = this.ini.getEnum("Armor", s.ArmorType, s.ArmorType.None, !0)),
              (this.crate = this.ini.getBool("Crate")));
            var e = this.ini.getBool("IsARock");
            ((this.isARock = e),
              (this.isRubble = this.ini.getBool("IsRubble")),
              (this.isVeinholeMonster = this.ini.getBool("IsVeinholeMonster")),
              (this.isVeins = this.ini.getBool("IsVeins")),
              (this.land = this.ini.getEnum("Land", i.LandType, i.LandType.Clear)),
              (this.noUseTileLandType = !!this.ini.getString("NoUseTileLandType")),
              (this.strength = this.ini.getNumber("Strength")),
              (this.tiberium = this.ini.getBool("Tiberium")));
            var t = this.ini.getBool("Wall");
            ((this.wall = t), (this.radarInvisible = this.ini.getBool("RadarInvisible", !t && !e)));
          }
        }),
          e("OverlayRules", a));
      },
    };
  },
);
