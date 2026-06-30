// === Reconstructed SystemJS module: game/rules/SuperWeaponRules ===
// deps: ["game/type/SuperWeaponType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/SuperWeaponRules", ["game/type/SuperWeaponType"], function (e, t) {
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
        "SuperWeaponRules",
        (r = class {
          constructor(e) {
            this.index = e;
          }
          readIni(e) {
            return (
              (this.disableableFromShell = e.getBool("DisableableFromShell")),
              (this.isPowered = e.getBool("IsPowered", !0)),
              (this.name = e.name),
              (this.preClick = e.getBool("PreClick")),
              (this.preDependent = e.getEnum("PreDependent", i.SuperWeaponType, void 0)),
              (this.postClick = e.getBool("PostClick")),
              (this.rechargeTime = e.getNumber("RechargeTime", 5)),
              (this.showTimer = e.getBool("ShowTimer")),
              (this.sidebarImage = e.getString("SidebarImage").toLowerCase()),
              (this.type = e.getEnum("Type", i.SuperWeaponType, void 0)),
              (this.uiName = e.getString("UIName")),
              (this.weaponType = e.getString("WeaponType") || void 0),
              this
            );
          }
        }),
      );
    },
  };
});
