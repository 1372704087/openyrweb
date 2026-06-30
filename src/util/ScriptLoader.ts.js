// === Reconstructed SystemJS module: util/ScriptLoader ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/ScriptLoader", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ScriptLoader",
        (i = class {
          constructor(e) {
            this.document = e;
          }
          load(n, o = {}) {
            return new Promise((e, t) => {
              let i = this.document.head,
                r = this.document.createElement("script");
              ((r.type = o.type || "text/javascript"),
                (r.charset = o.charset || "utf8"),
                (r.async = void 0 === o.async || o.async),
                (r.src = n));
              const s = o.attrs;
              (s && Object.keys(s).forEach((e) => r.setAttribute(e, s[e])),
                o.text && (r.text = o.text),
                (r.onload = () => {
                  e();
                }));
              let a = new Error(`Failed to load script "${n}"`);
              ((r.onerror = () => {
                t(a);
              }),
                i.appendChild(r));
            });
          }
        }),
      );
    },
  };
});
