// === Reconstructed SystemJS module: game/player/trait/SuperWeaponsTrait ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/player/trait/SuperWeaponsTrait", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SuperWeaponsTrait",
        (i = class {
          constructor() {
            this.superWeapons = new Map();
          }
          getAll() {
            return [...this.superWeapons.values()];
          }
          add(e) {
            this.superWeapons.set(e.name, e);
          }
          has(e) {
            return this.superWeapons.has(e);
          }
          get(e) {
            return this.superWeapons.get(e);
          }
          remove(e) {
            this.superWeapons.delete(e);
          }
        }),
      );
    },
  };
});
