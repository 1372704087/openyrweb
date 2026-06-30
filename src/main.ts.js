// === Reconstructed SystemJS module: main ===
// deps: ["Application"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("main", ["Application"], function (e, t) {
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
      ((r = new i.Application()),
        document.body
          ? r.main()
          : document.addEventListener("DOMContentLoaded", () => {
              r.main();
            }));
    },
  };
});
