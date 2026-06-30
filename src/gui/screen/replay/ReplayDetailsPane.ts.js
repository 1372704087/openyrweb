// === Reconstructed SystemJS module: gui/screen/replay/ReplayDetailsPane ===
// deps: ["react","util/format"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/replay/ReplayDetailsPane", ["react", "util/format"], function (e, t) {
  "use strict";
  var o, l;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "ReplayDetailsPane",
        ({
          replayDetails: { engineVersion: e, durationSeconds: t, gameId: i, gameTimestamp: r, mapName: s, players: a },
          strings: n,
        }) =>
          o.createElement(
            "div",
            { className: "replay-details" },
            o.createElement(
              "table",
              null,
              o.createElement(
                "tbody",
                null,
                r
                  ? o.createElement(
                      "tr",
                      null,
                      o.createElement("td", null, n.get("GUI:ReplayTime"), ":"),
                      o.createElement(
                        "td",
                        { dir: "auto" },
                        new Date(r * (String(r).length < 13 ? 1e3 : 1)).toLocaleString(),
                      ),
                    )
                  : null,
                o.createElement(
                  "tr",
                  null,
                  o.createElement("td", null, n.get("GUI:GameVersion"), ":"),
                  o.createElement("td", null, e),
                ),
                "0" !== i
                  ? o.createElement(
                      "tr",
                      null,
                      o.createElement("td", null, n.get("GUI:GameID"), ":"),
                      o.createElement("td", null, i),
                    )
                  : null,
                void 0 !== s &&
                  o.createElement(
                    "tr",
                    null,
                    o.createElement("td", null, n.get("GUI:Map"), ":"),
                    o.createElement("td", null, s),
                  ),
                a &&
                  o.createElement(
                    "tr",
                    null,
                    o.createElement("td", null, n.get("GUI:Players"), ":"),
                    o.createElement(
                      "td",
                      null,
                      a.map((e, t) =>
                        o.createElement(
                          o.Fragment,
                          { key: e.name },
                          t ? ", " : "",
                          o.createElement("span", { style: { color: e.color } }, e.name),
                        ),
                      ),
                    ),
                  ),
                void 0 !== t &&
                  o.createElement(
                    "tr",
                    null,
                    o.createElement("td", null, n.get("GUI:Duration"), ":"),
                    o.createElement("td", null, l.formatTimeDuration(t)),
                  ),
              ),
            ),
          ),
      );
    },
  };
});
