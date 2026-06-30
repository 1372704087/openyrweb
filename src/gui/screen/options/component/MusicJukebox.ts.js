// === Reconstructed SystemJS module: gui/screen/options/component/MusicJukebox ===
// deps: ["gui/component/List","react","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/MusicJukebox",
  ["gui/component/List", "react", "util/string"],
  function (e, t) {
    "use strict";
    var a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e("MusicJukebox", ({ music: t, strings: i }) => {
          const [r, s] = n.useState(() => t.getCurrentPlaylistItem());
          return n.default.createElement(
            "div",
            { className: "music-jukebox" },
            n.default.createElement(
              "div",
              { className: "jukebox-content" },
              n.default.createElement(
                "div",
                { className: "controls" },
                n.default.createElement(
                  "div",
                  null,
                  n.default.createElement(
                    "label",
                    null,
                    n.default.createElement("input", {
                      type: "checkbox",
                      defaultChecked: t.getShuffleMode(),
                      onChange: (e) => t.setShuffleMode(e.target.checked),
                    }),
                    i.get("GUI:Shuffle"),
                  ),
                ),
                n.default.createElement(
                  "div",
                  null,
                  n.default.createElement(
                    "label",
                    null,
                    n.default.createElement("input", {
                      type: "checkbox",
                      defaultChecked: t.getRepeatMode(),
                      onChange: (e) => t.setRepeatMode(e.target.checked),
                    }),
                    i.get("GUI:Repeat"),
                  ),
                ),
              ),
              n.default.createElement(
                a.List,
                { className: "playlist" },
                t
                  .getPlaylist()
                  .map((e, t) =>
                    n.default.createElement(
                      a.ListItem,
                      { key: e.name, selected: e === r, onClick: () => s(e) },
                      o.pad(t + 1, "00"),
                      " - ",
                      i.get(e.name),
                    ),
                  ),
              ),
            ),
            n.default.createElement(
              "div",
              { className: "jukebox-footer" },
              n.default.createElement(
                "button",
                { className: "dialog-button", onClick: () => r && t.selectPlaylistItem(r) },
                i.get("GUI:Play"),
              ),
              n.default.createElement(
                "button",
                { className: "dialog-button", onClick: () => t.stopPlaying() },
                i.get("GUI:Stop"),
              ),
            ),
          );
        });
      },
    };
  },
);
