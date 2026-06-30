// === Reconstructed SystemJS module: gui/screen/replay/KeepReplayBox ===
// deps: ["react","gui/component/Dialog","network/gamestate/Replay"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/replay/KeepReplayBox",
  ["react", "gui/component/Dialog", "network/gamestate/Replay"],
  function (e, t) {
    "use strict";
    var c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        e("KeepReplayBox", ({ defaultName: e, strings: t, viewport: i, onSubmit: r, onDismiss: s }) => {
          let a = c.useRef(null),
            [n, o] = c.useState(!1);
          c.useEffect(() => {
            setTimeout(() => {
              (a.current?.focus(), a.current?.setSelectionRange(0, a.current.value.length));
            }, 50);
          }, []);
          var l = (e) => {
            e && e.preventDefault();
            var t = a.current.value;
            t && (o(!0), r(t));
          };
          return c.default.createElement(
            h.Dialog,
            {
              className: "keep-replay-box",
              hidden: n,
              viewport: i,
              zIndex: 100,
              buttons: [
                { label: t.get("GUI:Ok"), onClick: l },
                {
                  label: t.get("GUI:Cancel"),
                  onClick: () => {
                    (o(!0), s?.());
                  },
                },
              ],
            },
            c.default.createElement(
              "form",
              { onSubmit: l },
              c.default.createElement(
                "div",
                { className: "field" },
                c.default.createElement("label", null, t.get("GUI:ReplayNamePrompt")),
                c.default.createElement("input", {
                  type: "text",
                  name: "replayname",
                  autoComplete: "off",
                  ref: a,
                  defaultValue: e,
                  maxLength: u.Replay.maxNameLength,
                }),
              ),
              c.default.createElement("button", { type: "submit", style: { visibility: "hidden" } }),
            ),
          );
        });
      },
    };
  },
);
