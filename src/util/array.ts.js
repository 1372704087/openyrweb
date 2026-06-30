// === Reconstructed SystemJS module: util/array ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/array", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("findReverse", function (e, t) {
      for (let i = e.length - 1; 0 <= i; i--) if (t(e[i], i, e)) return e[i];
    }),
    e("findIndexReverse", function (e, t) {
      for (let i = e.length - 1; 0 <= i; i--) if (t(e[i], i, e)) return i;
      return -1;
    }),
    e("equals", function (e, t) {
      if (e.length !== t.length) return !1;
      for (let i = 0, r = e.length; i < r; i++) if (e[i] !== t[i]) return !1;
      return !0;
    }),
    { setters: [], execute: function () {} }
  );
});
