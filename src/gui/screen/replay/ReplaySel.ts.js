// === Reconstructed SystemJS module: gui/screen/replay/ReplaySel ===
// deps: ["react","gui/component/List","gui/screen/replay/StorageWarning","gui/screen/replay/ReplayDetailsPane"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/replay/ReplaySel",
  ["react", "gui/component/List", "gui/screen/replay/StorageWarning", "gui/screen/replay/ReplayDetailsPane"],
  function (e, t) {
    "use strict";
    var n, o, l, c;
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
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e("ReplaySel", ({ strings: e, replays: t, selectedReplay: i, selectedReplayDetails: r, onSelectReplay: s }) => {
          const a = n.useRef(null);
          return (
            n.useEffect(() => {
              a.current?.scrollIntoView();
            }, []),
            n.default.createElement(
              "div",
              { className: "replay-sel-form" },
              n.default.createElement(
                o.List,
                { title: e.get("GUI:SelectReplay"), className: "replay-list" },
                t
                  ? t.map((e) => {
                      var t = e.id === i?.id;
                      return n.default.createElement(
                        o.ListItem,
                        {
                          key: e.id,
                          selected: t,
                          innerRef: t ? a : null,
                          onClick: () => s(e),
                          onDoubleClick: () => s(e, !0),
                          style: { display: "flex" },
                        },
                        n.default.createElement("div", { className: "replay-name" }, e.keep ? "" : "* ", e.name),
                        n.default.createElement(
                          "div",
                          { className: "replay-time", dir: "auto" },
                          new Date(e.timestamp).toLocaleString(),
                        ),
                      );
                    })
                  : n.default.createElement(o.ListItem, { style: { textAlign: "center" } }, e.get("GUI:LoadingEx")),
              ),
              r && n.default.createElement(c.ReplayDetailsPane, { replayDetails: r, strings: e }),
              n.default.createElement(l.StorageWarning, { strings: e }),
            )
          );
        });
      },
    };
  },
);
