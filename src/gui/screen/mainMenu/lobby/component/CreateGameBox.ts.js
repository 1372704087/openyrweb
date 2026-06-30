// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/component/CreateGameBox ===
// deps: ["react","gui/component/Dialog","network/WolConnection"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/component/CreateGameBox",
  ["react", "gui/component/Dialog", "network/WolConnection"],
  function (e, t) {
    "use strict";
    var g, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e("CreateGameBox", ({ strings: e, viewport: t, onSubmit: i, onDismiss: r }) => {
          let [s, a] = g.useState(!1),
            [n, o] = g.useState(""),
            l = g.useRef(null),
            c = g.useRef(null),
            [h, u] = g.useState(!1),
            d = g.useRef(null);
          return g.default.createElement(
            p.Dialog,
            {
              className: "login-box create-game-box",
              hidden: s,
              viewport: t,
              buttons: [
                { label: e.get("GUI:Ok"), onClick: () => c.current?.click() },
                {
                  label: e.get("GUI:Cancel"),
                  onClick: () => {
                    (a(!0), r?.());
                  },
                },
              ],
              zIndex: 100,
            },
            g.default.createElement(
              "form",
              {
                onSubmit: (e) => {
                  (e.preventDefault(), a(!0), i(n, h ? l.current.value : "", d.current.checked));
                },
                autoComplete: "off",
              },
              g.default.createElement(
                "div",
                { className: "field" },
                g.default.createElement("label", null, e.get("GUI:RoomDesc")),
                g.default.createElement("input", {
                  name: "roomname",
                  type: "text",
                  value: n,
                  maxLength: m.WolConnection.MAX_ROOM_DESC_LEN,
                  onChange: (e) => {
                    o(e.target.value);
                  },
                }),
              ),
              g.default.createElement(
                "div",
                { className: "field" },
                g.default.createElement("label", null, e.get("GUI:Password")),
                g.default.createElement("input", {
                  name: "enablepass",
                  type: "checkbox",
                  checked: h,
                  onChange: () => {
                    u(!h);
                  },
                }),
                g.default.createElement("input", {
                  name: "lobbypass",
                  type: "password",
                  autoComplete: "off",
                  "data-lpignore": "true",
                  ref: l,
                  disabled: !h,
                  required: h,
                }),
              ),
              g.default.createElement(
                "div",
                { className: "field" },
                g.default.createElement("label", null, e.get("GUI:Observe")),
                g.default.createElement("input", { type: "checkbox", name: "test", ref: d }),
              ),
              g.default.createElement("button", { type: "submit", ref: c, style: { visibility: "hidden" } }),
            ),
          );
        });
      },
    };
  },
);
