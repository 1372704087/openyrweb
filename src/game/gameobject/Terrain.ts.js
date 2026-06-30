// === Reconstructed SystemJS module: game/gameobject/Terrain ===
// deps: ["engine/type/ObjectType","game/gameobject/GameObject"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/Terrain", ["engine/type/ObjectType", "game/gameobject/GameObject"], function (e, t) {
  "use strict";
  var r, i, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((s = class extends i.GameObject {
        static factory(e, t, i) {
          return new this(e, t, i);
        }
        constructor(e, t, i) {
          (super(r.ObjectType.Terrain, e, t, i), (this.radarInvisible = this.rules.radarInvisible));
        }
      }),
        e("Terrain", s));
    },
  };
});
