// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/component/PasswordBox ===
// deps: ["react","gui/component/Dialog"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/lobby/component/PasswordBox", ["react", "gui/component/Dialog"], function (e, t) {
  "use strict";
  var l, c;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
      function (e) {
        c = e;
      },
    ],
    execute: function () {
      e("PasswordBox", ({ strings: e, viewport: t, onSubmit: i, onDismiss: r }) => {
        let s = l.useRef(null),
          [a, n] = l.useState(!1);
        l.useEffect(() => {
          setTimeout(() => {
            s.current?.focus();
          }, 50);
        }, []);
        var o = (e) => {
          (e && e.preventDefault(), n(!0), i(s.current.value));
        };
        return l.default.createElement(
          c.Dialog,
          {
            className: "login-box password-box",
            hidden: a,
            viewport: t,
            zIndex: 100,
            buttons: [
              { label: e.get("GUI:Ok"), onClick: o },
              {
                label: e.get("GUI:Cancel"),
                onClick: () => {
                  (n(!0), r?.());
                },
              },
            ],
          },
          l.default.createElement(
            "form",
            { onSubmit: o, autoComplete: "off" },
            l.default.createElement(
              "div",
              { className: "field" },
              l.default.createElement("label", null, e.get("GUI:Password")),
              l.default.createElement("input", {
                name: "lobbypass",
                type: "password",
                autoComplete: "off",
                "data-lpignore": "true",
                ref: s,
              }),
            ),
            l.default.createElement("button", { type: "submit", style: { visibility: "hidden" } }),
          ),
        );
      });
    },
  };
});
