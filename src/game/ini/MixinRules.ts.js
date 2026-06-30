// === Reconstructed SystemJS module: game/ini/MixinRules ===
// deps: ["game/ini/MixinRulesType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/ini/MixinRules", ["game/ini/MixinRulesType"], function (e, t) {
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
        "MixinRules",
        (r = class {
          static getTypes(e) {
            let t = [];
            return (e.noDogEngiKills && t.push(i.MixinRulesType.NoDogEngiKills), t);
          }
        }),
      );
    },
  };
});
