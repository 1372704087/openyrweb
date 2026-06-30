// === Reconstructed SystemJS module: gui/component/PlayerContextMenu ===
// deps: ["react","gui/component/List"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/PlayerContextMenu", ["react", "gui/component/List"], function (e, t) {
  "use strict";
  var r, s;
  t && t.id;
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
      e("PlayerContextMenu", ({ items: e, onClose: t }) => {
        const i = r.useRef(null);
        return (
          r.useEffect(() => {
            const e = (e) => {
              i.current && !i.current.contains(e.target) && t();
            };
            return (document.addEventListener("mousedown", e), () => document.removeEventListener("mousedown", e));
          }, [t]),
          r.default.createElement(
            s.List,
            { className: "player-context-menu", innerRef: i },
            e.map((t, e) =>
              r.default.createElement(
                s.ListItem,
                {
                  key: e,
                  className: "player-context-menu-item",
                  onClick: (e) => {
                    (e.stopPropagation(), t.onClick());
                  },
                },
                t.label,
              ),
            ),
          )
        );
      });
    },
  };
});
