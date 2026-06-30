// === Reconstructed SystemJS module: game/rules/TerrainRules ===
// deps: ["game/rules/ObjectRules","engine/TheaterType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/TerrainRules", ["game/rules/ObjectRules", "engine/TheaterType"], function (t, e) {
  "use strict";
  var i, r, a, s;
  e && e.id;
  function n(e, t) {
    switch (e) {
      case 0:
      case 1:
        return !0;
      case 2:
        return 0 != (t & a.Right);
      case 3:
        return 0 != (t & a.Left);
      case 4:
        return 0 != (t & a.Bottom);
      default:
        throw new Error('Invalid subCell "' + e);
    }
  }
  return (
    t("testOccupationBit", n),
    {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        var e;
        (((e = a || t("OccupationBits", (a = {})))[(e.All = 7)] = "All"),
          (e[(e.Right = 1)] = "Right"),
          (e[(e.Left = 2)] = "Left"),
          (e[(e.Bottom = 4)] = "Bottom"),
          (s = class extends i.ObjectRules {
            parse() {
              (super.parse(),
                (this.animationRate = this.ini.getNumber("AnimationRate")),
                (this.animationProbability = this.ini.getNumber("AnimationProbability")),
                (this.gate = this.ini.getBool("Gate")),
                (this.immune = this.ini.getBool("Immune")),
                (this.isAnimated = this.ini.getBool("IsAnimated")),
                (this.snowOccupationBits = this.normalizeOccupationBits(
                  this.ini.getNumber("SnowOccupationBits", a.All),
                )),
                (this.spawnsTiberium = this.ini.getBool("SpawnsTiberium")),
                (this.strength = this.ini.getNumber("Strength")),
                (this.radarInvisible = this.ini.getBool("RadarInvisible")),
                (this.temperateOccupationBits = this.normalizeOccupationBits(
                  this.ini.getNumber("TemperateOccupationBits", a.All),
                )));
            }
            normalizeOccupationBits(e) {
              return (e + 8 * Math.abs(Math.floor(e / 8))) % 8;
            }
            getOccupationBits(e) {
              return e !== r.TheaterType.Snow ? this.temperateOccupationBits : this.snowOccupationBits;
            }
            getOccupiedSubCells(e) {
              var t,
                i = this.getOccupationBits(e),
                r = [0, 1, 2, 3, 4];
              if (i === a.All) return r;
              let s = [];
              for (t of r) n(t, i) && s.push(t);
              return s;
            }
          }),
          t("TerrainRules", s));
      },
    }
  );
});
