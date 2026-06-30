// === Reconstructed SystemJS module: gui/component/PartyInviteDialog ===
// deps: ["react","gui/component/Dialog"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/PartyInviteDialog", ["react", "gui/component/Dialog"], function (e, t) {
  "use strict";
  var h, u;
  t && t.id;
  return {
    setters: [
      function (e) {
        h = e;
      },
      function (e) {
        u = e;
      },
    ],
    execute: function () {
      e(
        "PartyInviteDialog",
        ({ inviterName: e, strings: t, showPreventionCheckbox: i = !1, viewport: r, onAccept: s, onDecline: a }) => {
          const [n, o] = h.useState(!1),
            [l, c] = h.useState(!1);
          return h.default.createElement(
            u.Dialog,
            {
              hidden: n,
              viewport: r,
              zIndex: 100,
              buttons: [
                {
                  label: t.get("GUI:PartyInviteAccept"),
                  disabled: i && l,
                  onClick: () => {
                    (o(!0), s());
                  },
                },
                {
                  label: t.get("GUI:PartyInviteDecline"),
                  onClick: () => {
                    (o(!0), a(l));
                  },
                },
              ],
            },
            h.default.createElement(
              "div",
              null,
              h.default.createElement(
                "div",
                { style: { marginBottom: i ? "12px" : "0" } },
                t.get("GUI:PartyInviteReceived", e),
              ),
              i &&
                h.default.createElement(
                  "label",
                  { style: { display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "8px" } },
                  h.default.createElement("input", {
                    type: "checkbox",
                    checked: l,
                    onChange: (e) => c(e.target.checked),
                    style: { marginRight: "8px", cursor: "pointer" },
                  }),
                  h.default.createElement(
                    "span",
                    { style: { fontSize: "12px", color: "yellow" } },
                    t.get("GUI:PartyInvitePrevent", 60),
                  ),
                ),
            ),
          );
        },
      );
    },
  };
});
