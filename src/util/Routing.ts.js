// === Reconstructed SystemJS module: util/Routing ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/Routing", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Routing",
        (i = class {
          constructor() {
            this.routes = {};
          }
          addRoute(e, t) {
            this.routes[e] = { controller: t };
          }
          init() {
            (window.addEventListener("hashchange", () => this.router()), this.router());
          }
          async router() {
            let t = location.hash.slice(1) || "/";
            if (t.match(/^\//)) {
              var [, i, ...r] = t.split("/");
              this.routes["*"] && (await this.routes["*"].controller(r));
              let e = this.routes["/" + i];
              e.controller && (await e.controller(r));
            }
          }
        }),
      );
    },
  };
});
