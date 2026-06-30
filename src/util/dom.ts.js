// === Reconstructed SystemJS module: util/dom ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/dom", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("getOffset", function (e) {
      let t = 0,
        i = 0;
      for (; (t += e.offsetTop || 0), (i += e.offsetLeft || 0), (e = e.offsetParent););
      return { top: t, left: i };
    }),
    e("contains", function (e, t) {
      do {
        if (t === e) return !0;
      } while ((t = t.parentElement));
      return !1;
    }),
    { setters: [], execute: function () {} }
  );
});
