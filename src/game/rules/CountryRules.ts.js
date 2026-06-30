// === Reconstructed SystemJS module: game/rules/CountryRules ===
// deps: ["game/SideType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/CountryRules", ["game/SideType"], function (e, t) {
  "use strict";
  var i, r, s, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = new Map()
        .set("GDI", i.SideType.GDI)
        .set("Nod", i.SideType.Nod)
        .set("Civilian", i.SideType.Civilian)
        .set("Mutant", i.SideType.Mutant)
        .set("ThirdSide", i.SideType.ThirdSide)),
        (s = new Map([
          ["Americans", "STT:PlayerSideAmerica"],
          ["Alliance", "STT:PlayerSideKorea"],
          ["French", "STT:PlayerSideFrance"],
          ["Germans", "STT:PlayerSideGermany"],
          ["British", "STT:PlayerSideBritain"],
          ["Africans", "STT:PlayerSideLibya"],
          ["Arabs", "STT:PlayerSideIraq"],
          ["Confederation", "STT:PlayerSideCuba"],
          ["Russians", "STT:PlayerSideRussia"],
          ["YuriCountry", "STT:PlayerSideYuriCountry"],
        ])),
        e(
          "CountryRules",
          (a = class {
            constructor(e) {
              this.id = e;
            }
            readIni(e) {
              ((this.name = e.name),
                (this.uiName = e.getString("UIName")),
                (this.uiTooltip = e.getString("UITooltip") || s.get(this.name)));
              var t = e.getString("Side");
              if (!t) throw new Error(`Missing Side for country "${this.name}"`);
              var i = r.get(t);
              if (void 0 === i) throw new Error(`Unknown side "${t}" for country "${this.name}"`);
              ((this.side = i),
                (this.multiplay = e.getBool("Multiplay")),
                (this.multiplayPassive = e.getBool("MultiplayPassive")),
                (this.veteranAircraft = e.getArray("VeteranAircraft")),
                (this.veteranInfantry = e.getArray("VeteranInfantry")),
                (this.veteranUnits = e.getArray("VeteranUnits")));
            }
          }),
        ));
    },
  };
});
