// === Reconstructed SystemJS module: gui/screen/options/component/PressKeyInput ===
// deps: ["gui/FullScreen","react","gui/screen/options/component/getHumanReadableKey"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/PressKeyInput",
  ["gui/FullScreen", "react", "gui/screen/options/component/getHumanReadableKey"],
  function (e, t) {
    "use strict";
    var n, o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((c = (e) => e.shiftKey || e.ctrlKey || e.altKey || e.metaKey),
          (h = (e) => ["Alt", "Control", "Shift", "Meta"].includes(e.key)),
          (u = ["Escape", "Backspace", "Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "]),
          e("PressKeyInput", ({ tooltip: e, onChange: t }) => {
            const [i, r] = o.useState(),
              s = (e) => {
                (r(e), (e && void 0 === e.keyCode) || t(e));
              };
            var a = i ? l.getHumanReadableKey(i) : "";
            return o.default.createElement("input", {
              type: "text",
              value: a,
              "data-r-tooltip": e,
              onChange: () => {},
              onKeyDown: (e) => {
                (e.preventDefault(),
                  e.stopPropagation(),
                  e.repeat ||
                    255 < e.keyCode ||
                    (u.includes(e.key) || n.FullScreen.isFullScreenHotKey(e)
                      ? s(void 0)
                      : s({
                          shiftKey: e.shiftKey,
                          ctrlKey: e.ctrlKey,
                          altKey: e.altKey,
                          metaKey: e.metaKey,
                          keyCode: h(e) ? void 0 : e.keyCode,
                        })));
              },
              onKeyUp: (e) => {
                (e.preventDefault(),
                  e.stopPropagation(),
                  e.repeat ||
                    255 < e.keyCode ||
                    (void 0 === i?.keyCode &&
                      h(e) &&
                      s(
                        c(e)
                          ? {
                              shiftKey: e.shiftKey,
                              ctrlKey: e.ctrlKey,
                              altKey: e.altKey,
                              metaKey: e.metaKey,
                              keyCode: void 0,
                            }
                          : void 0,
                      )));
              },
              onBlur: () => {
                i && void 0 === i?.keyCode && s(void 0);
              },
            });
          }));
      },
    };
  },
);
