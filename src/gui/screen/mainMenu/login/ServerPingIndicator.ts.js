// === Reconstructed SystemJS module: gui/screen/mainMenu/login/ServerPingIndicator ===
// deps: ["react","classnames","gui/component/Image"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/login/ServerPingIndicator",
  ["react", "classnames", "gui/component/Image"],
  function (t, e) {
    "use strict";
    var r, s, a, i, n, o, l;
    e && e.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        var e;
        (((e = i = i || {})[(e.Good = 1)] = "Good"),
          (e[(e.Average = 2)] = "Average"),
          (e[(e.Bad = 3)] = "Bad"),
          (n = (e) => (e <= 100 ? i.Good : e <= 250 ? i.Average : i.Bad)),
          (o = new Map().set(i.Bad, "pingr").set(i.Average, "pingy").set(i.Good, "pingg")),
          (l = new Map().set(i.Bad, "ping-bad").set(i.Average, "ping-avg").set(i.Good, "ping-good")),
          t("ServerPingIndicator", ({ ping: e, strings: t }) => {
            var i = n(e);
            return r.default.createElement(
              "div",
              { className: "server-ping" },
              r.default.createElement(
                "span",
                { className: s.default("ping-text", l.get(i)) },
                t.get("TS:PingValue", e),
              ),
              r.default.createElement(a.Image, { src: o.get(i) + ".pcx" }),
            );
          }));
      },
    };
  },
);
