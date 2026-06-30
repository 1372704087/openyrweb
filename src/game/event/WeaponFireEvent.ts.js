// === Reconstructed SystemJS module: game/event/WeaponFireEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/WeaponFireEvent", ["game/event/EventType"], function (e, t) {
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
        "WeaponFireEvent",
        (r = class {
          constructor(e, t) {
            ((this.weapon = e), (this.gameObject = t), (this.type = i.EventType.WeaponFire));
          }
        }),
      );
    },
  };
});
