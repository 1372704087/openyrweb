// === Reconstructed SystemJS module: gui/screen/mainMenu/newAccount/NewAccountBox ===
// deps: ["react","network/WolConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/newAccount/NewAccountBox", ["react", "network/WolConfig"], function (e, t) {
  "use strict";
  var g, p, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        g = e;
      },
      function (e) {
        p = e;
      },
    ],
    execute: function () {
      ((i = ({ regions: e, initialRegion: t, strings: i, onRegionChange: r, onSubmit: s }, a) => {
        let [n, o] = g.useState(t.id),
          l = g.useRef(null),
          c = g.useRef(null),
          h = g.useRef(null),
          u = g.useRef(null);
        g.useEffect(() => {
          setTimeout(() => c.current?.focus(), 50);
        }, []);
        const d = () => {
          s(
            (() => {
              let e = {
                user: c.current.value,
                pass: h.current.value,
                passMatch: h.current.value === u.current.value,
                regionId: n,
              };
              return e;
            })(),
          );
        };
        g.useImperativeHandle(a, () => ({
          submit() {
            l.current?.requestSubmit ? l.current.requestSubmit() : d();
          },
        }));
        return g.default.createElement(
          "div",
          { className: "login-wrapper new-account-box" },
          g.default.createElement("div", { className: "title" }, i.get("GUI:NewAccount")),
          g.default.createElement(
            "form",
            {
              onSubmit: (e) => {
                (e.preventDefault(), d());
              },
              className: "login-form login-box",
              ref: l,
            },
            1 < e.length
              ? g.default.createElement(
                  "div",
                  { className: "field" },
                  g.default.createElement("label", null, i.get("TS:Region")),
                  g.default.createElement(
                    "select",
                    {
                      name: "server",
                      value: n,
                      onChange: (e) => {
                        var t = e.target.value;
                        (o(t), r(t));
                      },
                    },
                    e.map((e) =>
                      g.default.createElement("option", { value: e.id, key: e.id, disabled: !e.available }, e.label),
                    ),
                  ),
                )
              : g.default.createElement("input", { type: "hidden", name: "server", value: n }),
            g.default.createElement(
              "div",
              { className: "field" },
              g.default.createElement("label", null, i.get("GUI:Nickname")),
              g.default.createElement("input", {
                name: "user",
                type: "text",
                required: !0,
                minLength: p.MIN_USERNAME_LEN,
                maxLength: p.MAX_USERNAME_LEN,
                ref: c,
                autoComplete: "off",
              }),
            ),
            g.default.createElement(
              "div",
              { className: "field" },
              g.default.createElement("label", null, i.get("GUI:Password")),
              g.default.createElement("input", {
                name: "pass",
                type: "password",
                required: !0,
                minLength: p.MIN_PASS_LEN,
                maxLength: p.MAX_PASS_LEN,
                ref: h,
                autoComplete: "off",
              }),
            ),
            g.default.createElement(
              "div",
              { className: "field" },
              g.default.createElement("label", null, i.get("GUI:Re-enterPassword")),
              g.default.createElement("input", {
                name: "confirmPass",
                type: "password",
                required: !0,
                ref: u,
                autoComplete: "off",
              }),
            ),
            g.default.createElement("button", { type: "submit", style: { visibility: "hidden" } }),
          ),
        );
      }),
        e("NewAccountBox", g.forwardRef(i)));
    },
  };
});
