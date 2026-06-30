// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModDetailsPane ===
// deps: ["react","gui/screen/mainMenu/modSel/ModStatus"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/modSel/ModDetailsPane",
  ["react", "gui/screen/mainMenu/modSel/ModStatus"],
  function (e, t) {
    "use strict";
    var c, i, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((h = new Map([
          [i.ModStatus.Installed, "GUI:ModStatusInstalled"],
          [i.ModStatus.UpdateAvailable, "GUI:ModStatusUpdateAvail"],
          [i.ModStatus.NotInstalled, "GUI:ModStatusNotInstalled"],
        ])),
          e(
            "ModDetailsPane",
            ({
              modDetails: { supported: e, name: t, description: i, authors: r, version: s, website: a },
              modLoaded: n,
              modStatus: o,
              strings: l,
            }) =>
              c.createElement(
                "div",
                { className: "mod-details" },
                c.createElement(
                  "table",
                  null,
                  c.createElement(
                    "tbody",
                    null,
                    c.createElement(
                      "tr",
                      null,
                      c.createElement("td", null, l.get("GUI:ModName"), ":"),
                      c.createElement("td", null, t),
                    ),
                    c.createElement(
                      "tr",
                      null,
                      c.createElement("td", null, l.get("GUI:ModStatus"), ":"),
                      c.createElement(
                        "td",
                        null,
                        l.get(h.get(o) ?? "GUI:Unknown"),
                        n ? ", " + l.get("GUI:ModLoaded") : "",
                        e ? "" : ", " + l.get("GUI:ModUnsupported"),
                      ),
                    ),
                    s &&
                      c.createElement(
                        "tr",
                        null,
                        c.createElement("td", null, l.get("GUI:ModVersion"), ":"),
                        c.createElement("td", null, s),
                      ),
                    i &&
                      c.createElement(
                        "tr",
                        null,
                        c.createElement("td", null, l.get("GUI:ModDescription"), ":"),
                        c.createElement("td", { className: "mod-desc" }, i),
                      ),
                    r &&
                      c.createElement(
                        "tr",
                        null,
                        c.createElement("td", null, l.get("GUI:ModAuthor"), ":"),
                        c.createElement("td", null, r.join(", ")),
                      ),
                    a &&
                      c.createElement(
                        "tr",
                        null,
                        c.createElement("td", null, l.get("GUI:ModWebsite"), ":"),
                        c.createElement(
                          "td",
                          null,
                          c.createElement("a", { href: a, rel: "nofollow noopener", target: "_blank" }, a),
                        ),
                      ),
                  ),
                ),
              ),
          ));
      },
    };
  },
);
