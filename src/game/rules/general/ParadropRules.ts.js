// === Reconstructed SystemJS module: game/rules/general/ParadropRules ===
// deps: ["game/SideType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/ParadropRules", ["game/SideType"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "ParadropRules",
        (r = class {
          readIni(e) {
            if (
              ((this.allyParaDrop = this.readParadropSquad(
                e.getArray("AllyParaDropInf"),
                e.getNumberArray("AllyParaDropNum"),
                "Ally",
              )),
              (this.amerParaDrop = this.readParadropSquad(
                e.getArray("AmerParaDropInf"),
                e.getNumberArray("AmerParaDropNum"),
                "Amer",
              )),
              (this.sovParaDrop = this.readParadropSquad(
                e.getArray("SovParaDropInf"),
                e.getNumberArray("SovParaDropNum"),
                "Sov",
              )),
              (this.yuriParaDrop = this.readParadropSquad(
                e.getArray("YuriParaDropInf"),
                e.getNumberArray("YuriParaDropNum"),
                "Yuri",
              )),
              (this.paradropPlane = e.getString("ParadropPlane")),
              !this.paradropPlane)
            )
              throw new Error("Missing rules [General]->ParadropPlane");
            return ((this.paradropRadius = e.getNumber("ParadropRadius")), this);
          }
          readParadropSquad(e, t, i) {
            if (e.length !== t.length)
              throw new RangeError(`${i}ParaDropInf/Num size mismatch (${e.length}, ${t.length})`);
            let r = [];
            for (let s = 0; s < e.length; ++s) 0 < t[s] && r.push({ inf: e[s], num: t[s] });
            return r;
          }
          getParadropSquads(e) {
            switch (e) {
              case i.SideType.GDI:
                return this.allyParaDrop;
              case i.SideType.Nod:
                return this.sovParaDrop;
              case i.SideType.ThirdSide:
                return this.yuriParaDrop;
              default:
                throw new Error(`Unhandled side type "${e}"`);
            }
          }
        }),
      );
    },
  };
});
