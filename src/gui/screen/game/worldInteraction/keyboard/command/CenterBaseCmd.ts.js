// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd ===
// deps: ["engine/type/ObjectType","game/rules/TechnoRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd",
  ["engine/type/ObjectType", "game/rules/TechnoRules"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "CenterBaseCmd",
          (s = class {
            constructor(e, t, i, r) {
              ((this.player = e), (this.rules = t), (this.mapPanningHelper = i), (this.cameraPan = r));
            }
            execute() {
              let e;
              var t = this.player.production.getPrimaryFactory(r.FactoryType.BuildingType);
              (t
                ? (e = t.centerTile)
                : (t = this.player
                    .getOwnedObjectsByType(i.ObjectType.Vehicle)
                    .find((e) => this.rules.general.baseUnit.includes(e.name))) && (e = t.tile),
                e && this.cameraPan.setPan(this.mapPanningHelper.computeCameraPanFromTile(e.rx, e.ry)));
            }
          }),
        );
      },
    };
  },
);
