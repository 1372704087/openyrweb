// === Reconstructed SystemJS module: data/mapObjects ===
// deps: ["engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/mapObjects", ["engine/type/ObjectType"], function (e, t) {
  "use strict";
  var i, r, s, a, n;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      (e(
        "MapObject",
        (r = class {
          constructor(e) {
            this.type = e;
          }
          isStructure() {
            return this.type === i.ObjectType.Building;
          }
          isVehicle() {
            return this.type === i.ObjectType.Vehicle;
          }
          isInfantry() {
            return this.type === i.ObjectType.Infantry;
          }
          isAircraft() {
            return this.type === i.ObjectType.Aircraft;
          }
          isTerrain() {
            return this.type === i.ObjectType.Terrain;
          }
          isSmudge() {
            return this.type === i.ObjectType.Smudge;
          }
          isOverlay() {
            return this.type === i.ObjectType.Overlay;
          }
          isNamed() {
            return "name" in this;
          }
          isTechno() {
            return "health" in this;
          }
        }),
      ),
        (n = class extends r {}),
        (a = class extends n {}),
        (s = class extends a {
          constructor() {
            super(i.ObjectType.Building);
          }
        }),
        e("Structure", s),
        (s = class extends a {
          constructor() {
            super(i.ObjectType.Vehicle);
          }
        }),
        e("Vehicle", s),
        (s = class extends a {
          constructor() {
            super(i.ObjectType.Infantry);
          }
        }),
        e("Infantry", s),
        (a = class extends a {
          constructor() {
            super(i.ObjectType.Aircraft);
          }
        }),
        e("Aircraft", a),
        (a = class extends n {
          constructor() {
            super(i.ObjectType.Terrain);
          }
        }),
        e("Terrain", a),
        (n = class extends n {
          constructor() {
            super(i.ObjectType.Smudge);
          }
        }),
        e("Smudge", n),
        (n = class extends r {
          constructor() {
            super(i.ObjectType.Overlay);
          }
        }),
        e("Overlay", n));
    },
  };
});
