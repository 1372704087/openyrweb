// === Reconstructed SystemJS module: util/CssLoader ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/CssLoader", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CssLoader",
        (i = class {
          constructor(e) {
            this.document = e;
          }
          async load(r) {
            return new Promise((e, t) => {
              let i = document.createElement("link");
              ((i.rel = "stylesheet"),
                (i.type = "text/css"),
                (i.href = r),
                "onload" in i && (i.onload = () => e()),
                "onerror" in i && (i.onerror = () => t(new Error(`Couldn't load CSS at "${r}"`))),
                this.document.head.appendChild(i),
                "onload" in i || e());
            });
          }
        }),
      );
    },
  };
});
