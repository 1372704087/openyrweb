// === Reconstructed SystemJS module: gui/screen/options/component/KeyOpts ===
// deps: ["react","gui/screen/options/component/configurableCmds","gui/component/List","gui/screen/options/component/PressKeyInput","gui/screen/options/component/getHumanReadableKey","gui/screen/game/worldInteraction/keyboard/KeyboardHandler"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/KeyOpts",
  [
    "react",
    "gui/screen/options/component/configurableCmds",
    "gui/component/List",
    "gui/screen/options/component/PressKeyInput",
    "gui/screen/options/component/getHumanReadableKey",
    "gui/screen/game/worldInteraction/keyboard/KeyboardHandler",
  ],
  function (e, t) {
    "use strict";
    var T, v, b, S, w, E;
    t && t.id;
    return {
      setters: [
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
      ],
      execute: function () {
        e("KeyOpts", ({ strings: t, keyBinds: i, onResetAll: e, onHotKeyChange: r }) => {
          let [s, a] = T.useState(),
            [n, o] = T.useState(),
            [l, c] = T.useState(),
            [h, u] = T.useState(0),
            [d, g] = T.useState();
          const p = (e) => ("function" == typeof e ? e(t) : t.get(e));
          let m = s && v.configurableCmds.has(s) ? v.configurableCmds.get(s).desc : void 0;
          var f = m ? ("function" == typeof m ? m(t) : t.get(m)) : void 0,
            y = s ? i.getHotKey(s) : void 0;
          return T.default.createElement(
            "div",
            { className: "opts key-opts" },
            T.default.createElement(
              "div",
              { className: "key-opts-list" },
              T.default.createElement(
                "div",
                { className: "key-opts-left" },
                T.default.createElement(
                  b.List,
                  { title: t.get("GUI:Commands"), className: "key-list" },
                  [...v.configurableCmds].map(([e, { label: t }]) =>
                    T.default.createElement(
                      b.ListItem,
                      {
                        key: e,
                        selected: s === e,
                        onClick: () =>
                          ((e) => {
                            (a(e), o(void 0), u(h + 1), g(void 0));
                          })(e),
                      },
                      p(t),
                    ),
                  ),
                ),
              ),
              T.default.createElement(
                "div",
                { className: "key-opts-right" },
                T.default.createElement(
                  "fieldset",
                  { className: "key-opts-desc-container" },
                  T.default.createElement("legend", null, t.get("GUI:Description")),
                  T.default.createElement("div", { className: "key-opts-desc" }, f),
                ),
              ),
            ),
            T.default.createElement(
              "div",
              { className: "key-opts-assigns" },
              T.default.createElement(
                "div",
                { className: "key-opts-cur-assign" },
                T.default.createElement(
                  "div",
                  { className: "key-opts-left", "data-r-tooltip": t.get("STT:KeyboardLabelAssigned") },
                  T.default.createElement(
                    "div",
                    { className: "key-opts-cur-assign-label" },
                    t.get("GUI:CurrentShortcut"),
                  ),
                  T.default.createElement(
                    "div",
                    { className: "key-opts-cur-assign-value" },
                    y && w.getHumanReadableKey(y),
                  ),
                ),
                T.default.createElement("div", { className: "key-opts-right" }, d),
              ),
              T.default.createElement(
                "div",
                { className: "key-opts-ch-assign" },
                T.default.createElement(
                  "div",
                  { className: "key-opts-left" },
                  T.default.createElement("div", { className: "key-opts-ch-assign-label" }, t.get("GUI:PressShortcut")),
                  T.default.createElement(S.PressKeyInput, {
                    key: h,
                    onChange: (e) => {
                      (o(e ? i.getCommandType(e) : void 0), c(e), g(void 0));
                    },
                    tooltip: t.get("STT:KeyboardEditEntry"),
                  }),
                  T.default.createElement(
                    "div",
                    { className: "key-opts-ch-assign-current" },
                    T.default.createElement("div", null, t.get("GUI:CurAssignedTo")),
                    T.default.createElement(
                      "div",
                      null,
                      n && v.configurableCmds.has(n) ? p(v.configurableCmds.get(n).label) : "",
                    ),
                  ),
                ),
                T.default.createElement(
                  "div",
                  { className: "key-opts-right" },
                  T.default.createElement(
                    "button",
                    {
                      className: "dialog-button",
                      disabled: !s,
                      onClick: () => {
                        if (s) {
                          if (l && (l.shiftKey || l.ctrlKey || l.altKey || l.metaKey)) {
                            if (E.KeyboardHandler.anyModifierCommands.includes(s))
                              return void g(t.get("Error:CannotMap"));
                            var e = i.getCommandType({
                              keyCode: l.keyCode,
                              altKey: !1,
                              ctrlKey: !1,
                              shiftKey: !1,
                              metaKey: !1,
                            });
                            if (void 0 !== e && E.KeyboardHandler.anyModifierCommands.includes(e))
                              return void g(t.get("Error:CannotRemap"));
                          }
                          (r?.(s, l), o(void 0), c(void 0), u(h + 1), g(void 0));
                        }
                      },
                      "data-r-tooltip": t.get("STT:KeyboardButtonAssign"),
                    },
                    t.get("GUI:Assign"),
                  ),
                  T.default.createElement(
                    "button",
                    {
                      className: "dialog-button",
                      onClick: async () => {
                        (a(void 0), o(void 0), c(void 0), g(void 0), await e?.(), u(h + 1));
                      },
                      "data-r-tooltip": t.get("STT:KeyboardButtonResetAll"),
                    },
                    t.get("GUI:ResetAll"),
                  ),
                ),
              ),
              T.default.createElement(
                "fieldset",
                { className: "key-opts-ch-assign-warn" },
                T.default.createElement("legend", null, t.get("TS:Warning").toLocaleUpperCase()),
                t.get("TS:HotKeyFSWarning"),
              ),
            ),
          );
        });
      },
    };
  },
);
