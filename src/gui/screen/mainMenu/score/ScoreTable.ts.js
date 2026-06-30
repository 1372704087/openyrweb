// === Reconstructed SystemJS module: gui/screen/mainMenu/score/ScoreTable ===
// deps: ["classnames","game/gameopts/constants","gui/component/CountryIcon","react","util/format","gui/screen/mainMenu/lobby/component/RankIndicator","network/WolGameReport"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/score/ScoreTable",
  [
    "classnames",
    "game/gameopts/constants",
    "gui/component/CountryIcon",
    "react",
    "util/format",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
    "network/WolGameReport",
  ],
  function (e, t) {
    "use strict";
    var s, u, d, g, p, m, f, y;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
      ],
      execute: function () {
        (e(
          "ScoreTable",
          ({ game: e, singlePlayer: t, tournament: i, localPlayer: r, isQuit: s, gameReport: a, strings: n }) => {
            const o = e
              .getNonNeutralPlayers()
              .filter((e) => !e.isObserver || e.defeated)
              .sort((e, t) => t.score - e.score);
            let l = i && a;
            var c = a?.players.find((e) => e.name.toLowerCase() === r.name.toLowerCase());
            let h = c?.resultType;
            return (
              void 0 === h &&
                (e.stalemateDetectTrait?.isStale() && 0 === e.stalemateDetectTrait.getCountdownTicks()
                  ? (h = f.WolGameReportResult.Draw)
                  : r.defeated || s
                    ? e.alliances.getAllies(r).filter((e) => !e.isAi && !e.defeated).length ||
                      (h = f.WolGameReportResult.Loss)
                    : r.isObserver || (h = f.WolGameReportResult.Win)),
              g.default.createElement(
                "div",
                { className: "score-wrapper" },
                (h || !t) &&
                  g.default.createElement(
                    "div",
                    { className: "score-title" },
                    g.default.createElement(
                      "div",
                      { className: "game-result" },
                      h === f.WolGameReportResult.Win
                        ? n.get("gui:gameresultvictory")
                        : h === f.WolGameReportResult.Draw
                          ? n.get("gui:gameresultdraw")
                          : h === f.WolGameReportResult.Loss
                            ? n.get("gui:gameresultdefeat")
                            : "",
                    ),
                    !a &&
                      !t &&
                      (i || void 0 === h) &&
                      g.default.createElement("div", { className: "pending-results" }, n.get("gui:gameresultwaiting")),
                    c?.points &&
                      g.default.createElement(
                        "div",
                        { className: "points-gain" },
                        n.get("GUI:LadderPoints"),
                        " ",
                        c.points.value,
                        " (",
                        g.default.createElement(y, {
                          className: "points-gain-value",
                          value: c.points.gain,
                          win: h === f.WolGameReportResult.Win,
                        }),
                        ")",
                      ),
                  ),
                g.default.createElement(
                  "div",
                  { className: "score-header" },
                  g.default.createElement(
                    "div",
                    { "data-r-tooltip": n.get("STT:MPScoreLabelMapName") },
                    n.get("TXT_MAP", e.gameOpts.mapTitle),
                  ),
                  g.default.createElement(
                    "div",
                    { "data-r-tooltip": n.get("STT:MPScoreLabelTime") },
                    n.get("GUI:Time"),
                    ": ",
                    p.formatTimeDuration(Math.floor(e.currentTime / 1e3)),
                  ),
                ),
                g.default.createElement(
                  "table",
                  null,
                  g.default.createElement(
                    "thead",
                    null,
                    g.default.createElement(
                      "tr",
                      null,
                      g.default.createElement("th", null),
                      g.default.createElement("th", { className: "player-rank" }),
                      g.default.createElement(
                        "th",
                        { className: "player-name", "data-r-tooltip": n.get("STT:MPScoreLabelPlayer") },
                        n.get("GUI:Player"),
                      ),
                      l && g.default.createElement("th", { className: "number" }, n.get("GUI:MMR")),
                      g.default.createElement(
                        "th",
                        { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelKills") },
                        n.get("GUI:Kills"),
                      ),
                      g.default.createElement(
                        "th",
                        { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelLosses") },
                        n.get("GUI:Losses"),
                      ),
                      g.default.createElement(
                        "th",
                        { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelBuilt") },
                        n.get("GUI:Built"),
                      ),
                      g.default.createElement(
                        "th",
                        { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelScore") },
                        n.get("GUI:Score"),
                      ),
                    ),
                  ),
                  g.default.createElement(
                    "tbody",
                    null,
                    o.map((t, e) => {
                      var i = a?.players.find((e) => e.name.toLowerCase() === t.name.toLowerCase()),
                        r = i?.mmr?.value,
                        s = i?.mmr?.gain;
                      return g.default.createElement(
                        "tr",
                        { key: e, style: { color: t.color.asHexString() } },
                        g.default.createElement(
                          "td",
                          null,
                          g.default.createElement(d.CountryIcon, { country: t.country.name }),
                        ),
                        g.default.createElement(
                          "td",
                          { className: "player-rank" },
                          i && g.default.createElement(m.RankIndicator, { playerProfile: i, strings: n }),
                        ),
                        g.default.createElement(
                          "td",
                          { className: "player-name", "data-r-tooltip": n.get("STT:MPScoreLabelPlayer") },
                          t.isAi ? n.get(u.aiUiNames.get(t.aiDifficulty)) : t.name,
                        ),
                        l &&
                          g.default.createElement(
                            "td",
                            { className: "number player-mmr" },
                            r ?? "-",
                            void 0 !== s &&
                              g.default.createElement(
                                g.default.Fragment,
                                null,
                                " (",
                                g.default.createElement(y, {
                                  className: "mmr-gain",
                                  value: s,
                                  win: i?.resultType === f.WolGameReportResult.Win,
                                }),
                                ")",
                              ),
                          ),
                        g.default.createElement(
                          "td",
                          { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelKills") },
                          t.getUnitsKilled(),
                        ),
                        g.default.createElement(
                          "td",
                          { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelLosses") },
                          t.getUnitsLost(),
                        ),
                        g.default.createElement(
                          "td",
                          { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelBuilt") },
                          t.getUnitsBuilt(),
                        ),
                        g.default.createElement(
                          "td",
                          { className: "number", "data-r-tooltip": n.get("STT:MPScoreLabelScore") },
                          t.score,
                        ),
                      );
                    }),
                  ),
                ),
              )
            );
          },
        ),
          (y = ({ value: e, win: t, className: i }) => {
            let r;
            return (
              (r = 0 < e ? "+" : 0 === e ? (t ? "+" : "-") : ""),
              g.default.createElement("span", { className: s.default(i, { positive: t }) }, r, e)
            );
          }));
      },
    };
  },
);
