// === Reconstructed SystemJS module: gui/component/PingIndicator ===
// deps: ["react","gui/component/Image"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/PingIndicator", ["react", "gui/component/Image"], function (t, e) {
  "use strict";
  var r, s, i, a, n;
  e && e.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      var e;
      (((e = i = i || {})[(e.Good = 1)] = "Good"),
        (e[(e.Average = 2)] = "Average"),
        (e[(e.Bad = 3)] = "Bad"),
        (a = (e) => (e <= 100 ? i.Good : e <= 250 ? i.Average : i.Bad)),
        (n = new Map().set(i.Bad, "pingr").set(i.Average, "pingy").set(i.Good, "pingg")),
        t("PingIndicator", ({ ping: e, strings: t }) => {
          var i = void 0 !== e ? t.get("Msg:PingInfo", e) : void 0;
          return r.default.createElement(
            "div",
            { className: "ping-indicator", "data-r-tooltip": i, title: i },
            void 0 !== e ? r.default.createElement(s.Image, { src: n.get(a(e)) + ".pcx" }) : null,
          );
        }));
    },
  };
});
