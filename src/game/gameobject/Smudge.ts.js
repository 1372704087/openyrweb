// === Reconstructed SystemJS module: game/gameobject/Smudge ===
// deps: ["engine/type/ObjectType","game/gameobject/GameObject"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/Smudge", ["engine/type/ObjectType", "game/gameobject/GameObject"], function (e, t) {
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
          super(r.ObjectType.Smudge, e, t, i);
        }
        getFoundation() {
          return { width: this.rules.width, height: this.rules.height };
        }
      }),
        e("Smudge", s));
    },
  };
});
