// === Reconstructed SystemJS module: game/type/LocomotorType ===
// deps: ["game/type/SpeedType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/type/LocomotorType", ["game/type/SpeedType"], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("LocomotorType", (r = {})))[(e.Statue = 0)] = "Statue"),
        (e[(e.Aircraft = 1)] = "Aircraft"),
        (e[(e.Chrono = 2)] = "Chrono"),
        (e[(e.Hover = 3)] = "Hover"),
        (e[(e.Infantry = 4)] = "Infantry"),
        (e[(e.Jumpjet = 5)] = "Jumpjet"),
        (e[(e.Missile = 6)] = "Missile"),
        (e[(e.Ship = 7)] = "Ship"),
        (e[(e.Vehicle = 8)] = "Vehicle"),
        t(
          "locomotorTypesByClsId",
          new Map([
            ["{4A582746-9839-11d1-B709-00A024DDAFD1}", r.Aircraft],
            ["{4A582747-9839-11d1-B709-00A024DDAFD1}", r.Chrono],
            ["{4A582742-9839-11d1-B709-00A024DDAFD1}", r.Hover],
            ["{4A582744-9839-11d1-B709-00A024DDAFD1}", r.Infantry],
            ["{92612C46-F71F-11d1-AC9F-006008055BB5}", r.Jumpjet],
            ["{B7B49766-E576-11d3-9BD9-00104B972FE8}", r.Missile],
            ["{2BEA74E1-7CCA-11d3-BE14-00104B62A16C}", r.Ship],
            ["{4A582741-9839-11d1-B709-00A024DDAFD1}", r.Vehicle],
          ]),
        ),
        t(
          "defaultSpeedsByLocomotor",
          new Map([
            [r.Infantry, i.SpeedType.Foot],
            [r.Ship, i.SpeedType.Float],
            [r.Hover, i.SpeedType.Hover],
            [r.Jumpjet, i.SpeedType.Winged],
            [r.Aircraft, i.SpeedType.Winged],
            [r.Missile, i.SpeedType.Winged],
          ]),
        ));
    },
  };
});
