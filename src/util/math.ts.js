// === Reconstructed SystemJS module: util/math ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/math", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("getRandomInt", function (e, t) {
      return Math.floor(Math.random() * (t + 1 - e)) + e;
    }),
    e("clamp", function (e, t, i) {
      return Math.min(i, Math.max(e, t));
    }),
    e("isBetween", function (e, t, i) {
      return t <= e && e <= i;
    }),
    e("lerp", function (e, t, i) {
      return (1 - i) * e + i * t;
    }),
    e("truncToDecimals", function (e, t) {
      if (!e) return e;
      var i = 10 ** t;
      return 0 <= e ? Math.floor(e * i) / i : Math.ceil(e * i) / i;
    }),
    e("roundToDecimals", function (e, t) {
      if (!e) return e;
      var i = 10 ** t;
      return Math.round(e * i) / i;
    }),
    e("floorTo", function (e, t) {
      return Math.floor(e / t) * t;
    }),
    e("fnv32a", function (e) {
      let t = 2166136261;
      for (let i = 0, r = e.length; i < r; ++i)
        ((t ^= e[i]), (t += (t << 1) + (t << 4) + (t << 7) + (t << 8) + (t << 24)));
      return t >>> 0;
    }),
    { setters: [], execute: function () {} }
  );
});
