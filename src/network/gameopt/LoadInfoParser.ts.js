// === Reconstructed SystemJS module: network/gameopt/LoadInfoParser ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gameopt/LoadInfoParser", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LoadInfoParser",
        (i = class {
          parse(e) {
            let t = [];
            var i = e.split(",");
            for (let s = 0; s < i.length / 5; ++s) {
              var r = {
                name: i[5 * s],
                status: Number(i[5 * s + 1]),
                loadPercent: Number(i[5 * s + 2]),
                ping: Number(i[5 * s + 3]),
                lagAllowanceMillis: Number(i[5 * s + 4]),
              };
              t.push(r);
            }
            return t;
          }
        }),
      );
    },
  };
});
