// === Reconstructed SystemJS module: game/rules/MpDialogSettings ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/MpDialogSettings", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MpDialogSettings",
        (i = class {
          readIni(e) {
            return (
              (this.minMoney = e.getNumber("MinMoney")),
              (this.money = e.getNumber("Money")),
              (this.maxMoney = e.getNumber("MaxMoney")),
              (this.moneyIncrement = e.getNumber("MoneyIncrement")),
              (this.minUnitCount = e.getNumber("MinUnitCount")),
              (this.unitCount = e.getNumber("UnitCount")),
              (this.maxUnitCount = e.getNumber("MaxUnitCount")),
              (this.crates = e.getBool("Crates")),
              (this.gameSpeed = e.getNumber("GameSpeed")),
              (this.mcvRedeploys = e.getBool("MCVRedeploys")),
              (this.shortGame = e.getBool("ShortGame")),
              (this.superWeapons = e.getBool("SuperWeapons")),
              (this.techLevel = e.getNumber("TechLevel")),
              (this.alliesAllowed = e.getBool("AlliesAllowed", !0)),
              (this.allyChangeAllowed = e.getBool("AllyChangeAllowed", !0)),
              (this.mustAlly = e.getBool("MustAlly")),
              (this.bridgeDestruction = e.getBool("BridgeDestruction", !0)),
              (this.multiEngineer = e.getBool("MultiEngineer")),
              this
            );
          }
        }),
      );
    },
  };
});
