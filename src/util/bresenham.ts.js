// === Reconstructed SystemJS module: util/bresenham ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/bresenham", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("bresenham", function (s, a, n, o, l) {
      let i = [];
      l =
        l ||
        ((e, t) => {
          i.push({ x: e, y: t });
        });
      var e = n - s,
        t = o - a,
        c = Math.abs(e),
        h = Math.abs(t);
      let u = 0;
      var d = 0 < e ? 1 : -1,
        g = 0 < t ? 1 : -1;
      if (h < c)
        for (let e = s, t = a; d < 0 ? e >= n : e <= n; e += d)
          (l(e, t), (u += h), u << 1 >= c && ((t += g), (u -= c)));
      else
        for (let i = s, r = a; g < 0 ? r >= o : r <= o; r += g)
          (l(i, r), (u += c), u << 1 >= h && ((i += d), (u -= h)));
      return i;
    }),
    { setters: [], execute: function () {} }
  );
});
