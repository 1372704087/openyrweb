// === Reconstructed SystemJS module: gui/component/PromptDialog ===
// deps: ["react","gui/component/Dialog"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/PromptDialog", ["react", "gui/component/Dialog"], function (e, t) {
  "use strict";
  var u, d;
  t && t.id;
  return {
    setters: [
      function (e) {
        u = e;
      },
      function (e) {
        d = e;
      },
    ],
    execute: function () {
      e(
        "PromptDialog",
        ({ viewport: e, promptText: t, submitLabel: i, cancelLabel: r, inputProps: s, onSubmit: a, onDismiss: n }) => {
          let o = u.useRef(null),
            [l, c] = u.useState(!1);
          u.useEffect(() => {
            setTimeout(() => {
              o.current?.focus();
            }, 50);
          }, []);
          var h = (e) => {
            (e && e.preventDefault(), c(!0), a(o.current.value));
          };
          return u.default.createElement(
            d.Dialog,
            {
              className: "prompt-box",
              hidden: l,
              viewport: e,
              zIndex: 100,
              buttons: [
                { label: i, onClick: h },
                {
                  label: r,
                  onClick: () => {
                    (c(!0), n?.());
                  },
                },
              ],
            },
            u.default.createElement(
              "form",
              { onSubmit: h, autoComplete: "off" },
              u.default.createElement(
                "div",
                { className: "field" },
                u.default.createElement(
                  "label",
                  null,
                  t
                    .split(/\r?\n/)
                    .map((e, t) =>
                      u.default.createElement(
                        u.default.Fragment,
                        { key: t },
                        t ? u.default.createElement("br", null) : null,
                        e,
                      ),
                    ),
                ),
                u.default.createElement("input", {
                  name: "promptvalue",
                  type: "text",
                  autoComplete: "off",
                  "data-lpignore": "true",
                  ref: o,
                  ...s,
                }),
              ),
              u.default.createElement("button", { type: "submit", style: { visibility: "hidden" } }),
            ),
          );
        },
      );
    },
  };
});
