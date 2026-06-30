// === Reconstructed SystemJS module: gui/screen/mainMenu/mapSel/component/MapSel ===
// deps: ["react","gui/component/List","gui/component/Select","gui/component/Option"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/mapSel/component/MapSel",
  ["react", "gui/component/List", "gui/component/Select", "gui/component/Option"],
  function (t, e) {
    "use strict";
    var y, T, v, b, S, w;
    e && e.id;
    return {
      setters: [
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
      ],
      execute: function () {
        var e;
        (((e = S || t("SortType", (S = {}))).None = ""),
          (e.NameAsc = "nameAsc"),
          (e.NameDesc = "nameDesc"),
          (e.MaxSlotsAsc = "maxSlotsAsc"),
          (e.MaxSlotsDesc = "maxSlotsDesc"),
          (w = (e, t) => {
            switch (t) {
              case S.None:
                return e;
              case S.NameAsc:
                return e.sort((e, t) => e.mapTitle.localeCompare(t.mapTitle));
              case S.NameDesc:
                return e.sort((e, t) => t.mapTitle.localeCompare(e.mapTitle));
              case S.MaxSlotsAsc:
                return e.sort((e, t) => e.maxSlots - t.maxSlots);
              case S.MaxSlotsDesc:
                return e.sort((e, t) => t.maxSlots - e.maxSlots);
              default:
                throw new Error(`Unsupported sort type "${t}"`);
            }
          }),
          t(
            "MapSel",
            ({
              strings: t,
              gameModes: e,
              maps: i,
              selectedGameMode: r,
              selectedMapName: s,
              initialSortType: a,
              onSelectGameMode: n,
              onSelectMap: o,
              onSelectSort: l,
            }) => {
              const c = y.useRef(null),
                [h, u] = y.useState(i),
                [d, g] = y.useState(""),
                [p, m] = y.useState(a);
              (y.useEffect(() => {
                f();
              }, [i, d, p]),
                y.useEffect(() => {
                  let e = setTimeout(() => c.current?.scrollIntoView(), 50);
                  return () => clearTimeout(e);
                }, [i]));
              const f = () => {
                u(
                  w(
                    i.filter((e) => e.mapTitle.toLowerCase().includes(d.toLowerCase())),
                    p,
                  ),
                );
              };
              return y.default.createElement(
                "div",
                { className: "map-sel-form" },
                y.default.createElement("div", { className: "map-sel-title" }, t.get("GUI:SelectEngagement")),
                y.default.createElement(
                  "div",
                  { className: "map-sel-body" },
                  y.default.createElement(
                    "div",
                    { className: "map-sel-game-mode" },
                    y.default.createElement(
                      T.List,
                      {
                        title: t.get("GUI:GameType"),
                        className: "game-mode-list",
                        tooltip: t.get("STT:ScenarioListGameType"),
                      },
                      e.map((e) =>
                        y.default.createElement(
                          T.ListItem,
                          { key: e.id, selected: r === e, onClick: () => n(e), "data-r-tooltip": t.get(e.description) },
                          t.get(e.label),
                        ),
                      ),
                    ),
                  ),
                  y.default.createElement(
                    "div",
                    { className: "map-sel-map" },
                    y.default.createElement(
                      T.List,
                      {
                        title: y.default.createElement(
                          "div",
                          { className: "map-list-title" },
                          y.default.createElement("div", null, t.get("GUI:GameMap")),
                          y.default.createElement(
                            "div",
                            { className: "map-list-sort", "data-r-tooltip": t.get("STT:SortBy") },
                            y.default.createElement("label", null, "⇵"),
                            y.default.createElement(
                              v.Select,
                              {
                                initialValue: p,
                                onSelect: (e) =>
                                  ((e) => {
                                    (m(e), l(e));
                                  })(e),
                                className: "map-list-sort-select",
                              },
                              y.default.createElement(b.Option, { value: S.None, label: t.get("TS:SortNone") }),
                              y.default.createElement(b.Option, {
                                value: S.NameAsc,
                                label: t.get("TS:SortName") + " ↓",
                              }),
                              y.default.createElement(b.Option, {
                                value: S.NameDesc,
                                label: t.get("TS:SortName") + " ↑",
                              }),
                              y.default.createElement(b.Option, {
                                value: S.MaxSlotsAsc,
                                label: t.get("TS:SortMaxSlots") + " ↓",
                              }),
                              y.default.createElement(b.Option, {
                                value: S.MaxSlotsDesc,
                                label: t.get("TS:SortMaxSlots") + " ↑",
                              }),
                            ),
                          ),
                        ),
                        className: "map-list",
                        tooltip: t.get("STT:ScenarioListMaps"),
                      },
                      h.map((e) => {
                        var t = e.mapName === s;
                        return y.default.createElement(
                          T.ListItem,
                          {
                            key: e.mapName,
                            selected: t,
                            innerRef: t ? c : null,
                            onClick: () => o(e.mapName, !1),
                            onDoubleClick: () => o(e.mapName, !0),
                          },
                          e.mapTitle,
                        );
                      }),
                    ),
                    y.default.createElement(
                      "div",
                      { className: "map-sel-search" },
                      y.default.createElement(
                        "label",
                        null,
                        y.default.createElement("span", null, t.get("GUI:Search")),
                        y.default.createElement("input", {
                          type: "text",
                          className: "new-message",
                          value: d,
                          onChange: (e) => {
                            var t = e.target.value;
                            g(t);
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              );
            },
          ));
      },
    };
  },
);
