// === Reconstructed SystemJS module: data/IniParser ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/IniParser", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "IniParser",
        (i = class {
          parse(e) {
            let a = {},
              i = a,
              r,
              s = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i,
              t = e.split(/[\r\n]+/g);
            return (
              t.forEach((e) => {
                if (e && !e.match(/^\s*[;#]/)) {
                  var t = (e = e.replace(/]\s*(\/\/|;|#).*$/, "]")).match(s);
                  if (t) {
                    if (void 0 !== t[1]) return ((r = this.unsafe(t[1])), void (i = a[r] = a[r] || {}));
                    let e = this.unsafe(t[2]);
                    t = t[3] ? this.unsafe(t[4] || "") : "";
                    (2 < e.length &&
                      "[]" === e.slice(-2) &&
                      ((e = e.substring(0, e.length - 2)), i[e] ? Array.isArray(i[e]) || (i[e] = [i[e]]) : (i[e] = [])),
                      Array.isArray(i[e]) ? i[e].push(t) : (i[e] = t));
                  }
                }
              }),
              Object.keys(a)
                .filter((e) => {
                  if (!a[e] || "object" != typeof a[e] || Array.isArray(a[e])) return !1;
                  let t = this.dotSplit(e),
                    i = a,
                    r = t.pop();
                  var s = r.replace(/\\\./g, ".");
                  return (
                    t.forEach(function (e) {
                      ((i[e] && "object" == typeof i[e]) || (i[e] = {}), (i = i[e]));
                    }),
                    (i !== a || s !== r) && ((i[s] = a[e]), !0)
                  );
                })
                .forEach(function (e) {
                  delete a[e];
                }),
              a
            );
          }
          dotSplit(e) {
            return e
              .replace(/\x01/g, "LITERAL\\1LITERAL")
              .replace(/\\\./g, "")
              .split(/\./)
              .map((e) => e.replace(/\x01/g, "\\.").replace(/\x02LITERAL\\1LITERAL\x02/g, ""));
          }
          isQuoted(e) {
            return ('"' === e.charAt(0) && '"' === e.slice(-1)) || ("'" === e.charAt(0) && "'" === e.slice(-1));
          }
          unsafe(s) {
            if (((s = (s || "").trim()), this.isQuoted(s))) return (s = s.substr(1, s.length - 2));
            {
              let e = !1,
                t = "";
              for (let i = 0, r = s.length; i < r; i++) {
                var a = s.charAt(i);
                if (e) (-1 !== "\\;#".indexOf(a) ? (t += a) : (t += "\\" + a), (e = !1));
                else {
                  if (-1 !== ";#".indexOf(a)) break;
                  "\\" === a ? (e = !0) : (t += a);
                }
              }
              return (e && (t += "\\"), (t = t.trim()), t);
            }
          }
        }),
      );
    },
  };
});
