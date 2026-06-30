// === Reconstructed SystemJS module: util/time ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/time", [], function (e, t) {
  "use strict";
  t && t.id;
  async function o(t) {
    return new Promise((e) => {
      setTimeout(() => e(), t);
    });
  }
  function a(r, s) {
    let a = !1,
      n = Number.NEGATIVE_INFINITY;
    return async function (...e) {
      var t, i;
      a ||
        ((i = (t = Date.now()) - n),
        (n = s <= i ? t : ((a = !0), await o(s - i), (a = !1), Date.now())),
        await r.apply(this, e));
    };
  }
  return (
    e("sleep", o),
    e("throttle", a),
    e("Throttle", function (s) {
      return (e, t, i) => {
        var r = i.value;
        i.value = a(r, s);
      };
    }),
    { setters: [], execute: function () {} }
  );
});
