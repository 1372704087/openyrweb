// === Reconstructed SystemJS module: util/format ===
// deps: ["util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/format", ["util/string"], function (e, t) {
  "use strict";
  var a;
  t && t.id;
  return (
    e("formatTimeDuration", function (e, t = !1) {
      var i = Math.floor(e / 3600);
      e -= 3600 * i;
      var r = Math.floor(e / 60),
        s = (e -= 60 * r);
      return [...(i || !t ? [i] : []), a.pad(r, "00"), a.pad(s, "00")].join(":");
    }),
    {
      setters: [
        function (e) {
          a = e;
        },
      ],
      execute: function () {},
    }
  );
});
