// === Reconstructed SystemJS module: game/gameobject/locomotor/LocomotorFactory ===
// deps: ["game/type/LocomotorType","game/gameobject/locomotor/ChronoLocomotor","game/gameobject/locomotor/DriveLocomotor","game/gameobject/locomotor/FootLocomotor","game/gameobject/locomotor/HoverLocomotor","game/gameobject/locomotor/JumpjetLocomotor","game/gameobject/locomotor/MissileLocomotor","game/gameobject/locomotor/WingedLocomotor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/LocomotorFactory",
  [
    "game/type/LocomotorType",
    "game/gameobject/locomotor/ChronoLocomotor",
    "game/gameobject/locomotor/DriveLocomotor",
    "game/gameobject/locomotor/FootLocomotor",
    "game/gameobject/locomotor/HoverLocomotor",
    "game/gameobject/locomotor/JumpjetLocomotor",
    "game/gameobject/locomotor/MissileLocomotor",
    "game/gameobject/locomotor/WingedLocomotor",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h;
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
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "LocomotorFactory",
          (h = class {
            constructor(e) {
              this.game = e;
            }
            create(e) {
              var t = e.rules.locomotor;
              switch (t) {
                case i.LocomotorType.Infantry:
                  return new a.FootLocomotor(this.game);
                case i.LocomotorType.Jumpjet:
                  return new o.JumpjetLocomotor(this.game);
                case i.LocomotorType.Vehicle:
                case i.LocomotorType.Ship:
                  return new s.DriveLocomotor(this.game);
                case i.LocomotorType.Chrono:
                  return e.isVehicle() && e.harvesterTrait && e.rules.teleporter
                    ? new s.DriveLocomotor(this.game)
                    : new r.ChronoLocomotor(this.game);
                case i.LocomotorType.Aircraft:
                  return new c.WingedLocomotor(this.game);
                case i.LocomotorType.Missile:
                  return new l.MissileLocomotor(this.game, this.game.rules.general.getMissileRules(e.name));
                case i.LocomotorType.Hover:
                  return new n.HoverLocomotor(this.game.rules.general.hover);
                default:
                  throw new Error("Unhandled locomotor type " + t);
              }
            }
          }),
        );
      },
    };
  },
);
