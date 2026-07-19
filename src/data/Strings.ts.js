// === Reconstructed SystemJS module: data/Strings ===
// deps: ["sprintf-js","data/CsfFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/Strings", ["sprintf-js", "data/CsfFile"], function (e, t) {
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
      e(
        "Strings",
        (s = class {
          constructor(e) {
            ((this.data = {}),
              (this.warnedKeys = new Set()),
              e instanceof i.CsfFile ? this.fromCsf(e) : "object" == typeof e && this.fromJson(e));
          }
          fromCsf(e) {
            this.fromJson(e.data);
          }
          fromJson(e) {
            for (var t of Object.keys(e)) this.setValue(t, this.sanitizeValue(e[t]));
          }
          sanitizeValue(e) {
            return e.replace(/%hs/g, "%s");
          }
          setValue(e, t) {
            this.data[e.toLowerCase()] = t;
          }
          has(e) {
            return !!this.data[e.toLowerCase()];
          }
          get(e, ...t) {
            let i = this.data[e.toLowerCase()];
            return i
              ? "string" != typeof i
                ? (console.warn(`Invalid string value for name "${e}"`), e)
                : (t.length && (i = r.sprintf(i, ...t)), i)
              : e.match(/^NOSTR:/i)
                ? e.replace(/^NOSTR:/i, "")
                : (this.warnedKeys.has(e.toLowerCase()) ||
                    (this.warnedKeys.add(e.toLowerCase()), console.warn(`String with name "${e}" not found"`)),
                  e);
          }
        }),
      );
    },
  };
});
