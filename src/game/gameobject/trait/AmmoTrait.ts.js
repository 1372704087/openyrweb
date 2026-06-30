// === Reconstructed SystemJS module: game/gameobject/trait/AmmoTrait ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/trait/AmmoTrait", ["util/math"], function (e, t) {
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
        "AmmoTrait",
        (r = class {
          constructor(e, t = e) {
            ((this.maxAmmo = e), (this.ammo = t));
          }
          get ammo() {
            return this._ammo;
          }
          set ammo(e) {
            this._ammo = i.clamp(e, 0, this.maxAmmo);
          }
          isFull() {
            return this.ammo === this.maxAmmo;
          }
        }),
      );
    },
  };
});
