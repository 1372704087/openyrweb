// === Reconstructed SystemJS module: gui/screen/mainMenu/ladder/component/Ladder ===
// deps: ["react","classnames","gui/screen/mainMenu/lobby/component/RankIndicator","gui/component/Select","gui/component/Option","network/ladder/wladderConfig","gui/component/List","network/ladder/WLadderService"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/ladder/component/Ladder",
  [
    "react",
    "classnames",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
    "gui/component/Select",
    "gui/component/Option",
    "network/ladder/wladderConfig",
    "gui/component/List",
    "network/ladder/WLadderService",
  ],
  function (e, t) {
    "use strict";
    var R, P, m, I, k, i, B, f, N, j;
    t && t.id;
    function L(e, t) {
      return e === f.WLadderService.CURRENT_SEASON
        ? t.get("GUI:LadderCurrent")
        : e === f.WLadderService.PREV_SEASON
          ? t.get("GUI:LadderPrev")
          : t.get("GUI:LadderSeason", e);
    }
    function D(e) {
      return new Date(e).toLocaleDateString(void 0, { dateStyle: "medium" });
    }
    function F(e) {
      return new Date(e).toLocaleTimeString(void 0, { timeStyle: "short" });
    }
    return {
      setters: [
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          f = e;
        },
      ],
      execute: function () {
        ((N = new Map([
          [i.LadderType.Solo1v1, "gui:laddertype1v1"],
          [i.LadderType.Random2v2, "gui:laddertype2v2random"],
        ])),
          e(
            "Ladder",
            ({
              players: e,
              highlightPlayer: t,
              hasPrevPage: i,
              hasNextPage: r,
              seasons: s,
              selectedSeason: a,
              seasonDetails: n,
              ladders: o,
              selectedLadder: l,
              serverRegion: c,
              disabled: h,
              strings: u,
              onFirstPageClick: d,
              onPrevPageClick: g,
              onNextPageClick: p,
              onLastPageClick: m,
              onPlayerSearch: f,
              onSeasonSelect: y,
              onLadderSelect: T,
              onLadderTypeSelect: v,
            }) => {
              if (!e) return R.createElement("div", { className: "ladder" }, u.get("GUI:LoadingEx"));
              const b = R.useRef(null),
                [S, w] = R.useState(!l);
              R.useEffect(() => {
                w(!l);
              }, [l]);
              const E = (e) => e.type + "_" + e.id;
              var C = e.some((e) => void 0 !== e.mmr),
                x = e.some((e) => void 0 !== e.points);
              let O = l?.type,
                A = [...new Set(n?.ladders.map((e) => e.type) ?? (O ? [O] : void 0))];
              var M = n?.totalRankedPlayers.find((e) => e.ladderType === O)?.value;
              return R.createElement(
                "div",
                { className: "ladder" },
                R.createElement(
                  "div",
                  { className: P.default("toolbar", { "no-season-select": !s || s.length < 2 }) },
                  void 0 !== s &&
                    0 < s.length &&
                    R.createElement(
                      I.Select,
                      { disabled: h, initialValue: a ?? s[0], onSelect: y, className: "season-select" },
                      s.map((e) => R.createElement(k.Option, { key: e, label: L(e, u), value: e })),
                    ),
                  !S &&
                    R.createElement(
                      R.Fragment,
                      null,
                      void 0 !== o &&
                        0 < o.length &&
                        R.createElement(
                          I.Select,
                          {
                            disabled: h,
                            initialValue: E(l ?? o[0]),
                            onSelect: (e) => {
                              let { type: t, id: i } = ((e) => {
                                var [t, i] = e.split("_");
                                return { type: t, id: Number(i) };
                              })(e);
                              var r = o?.find((e) => e.id === i && e.type === t);
                              r && T(r);
                            },
                            className: "ladder-select",
                          },
                          o.map((e) =>
                            R.createElement(k.Option, {
                              key: e.type + "_" + e.id,
                              label:
                                e.name + (e.divisionName ? ", " + u.get("GUI:LadderDivision", e.divisionName) : ""),
                              value: E(e),
                            }),
                          ),
                          M
                            ? R.createElement(k.Option, {
                                label: u.get("GUI:LadderRankedPlayers", M),
                                disabled: !0,
                                value: "",
                              })
                            : void 0,
                        ),
                      R.createElement(
                        "form",
                        {
                          className: "player-search",
                          onSubmit: (e) => {
                            (e.preventDefault(), b.current?.value && (f(b.current.value), (b.current.value = "")));
                          },
                        },
                        R.createElement("input", {
                          className: "player",
                          type: "text",
                          disabled: h,
                          ref: b,
                          placeholder: u.get("GUI:Player"),
                        }),
                        R.createElement("button", { type: "submit", disabled: h }, u.get("GUI:Search")),
                      ),
                    ),
                ),
                R.createElement(
                  "div",
                  { className: "ladder-content" },
                  R.createElement(
                    B.List,
                    { className: "ladder-types" },
                    R.createElement(
                      B.ListItem,
                      { selected: S, disabled: h, onClick: () => w(!0) },
                      u.get("gui:ladderseasoninfo"),
                    ),
                    A.map((e) =>
                      R.createElement(
                        B.ListItem,
                        {
                          key: e,
                          selected: !S && O === e,
                          disabled: h,
                          onClick: () => {
                            (w(!1), v(e));
                          },
                        },
                        u.get(N.get(e) ?? e),
                      ),
                    ),
                  ),
                  S && n
                    ? R.createElement(
                        "div",
                        { className: "season-info" },
                        R.createElement(
                          "header",
                          null,
                          R.createElement("h2", null, L(n.name, u)),
                          void 0 !== n.startTime &&
                            void 0 !== n.endTime &&
                            R.createElement("p", null, D(n.startTime) + " - " + D(n.endTime)),
                        ),
                        void 0 !== n.topTierStartTime &&
                          R.createElement(
                            "div",
                            { className: "item" },
                            R.createElement("span", { className: "label" }, u.get("gui:laddertoptierstart")),
                            R.createElement("span", { className: "label" }, D(n.topTierStartTime)),
                          ),
                        void 0 !== n.nextTopTierDemoteTime &&
                          R.createElement(
                            "div",
                            { className: "item" },
                            R.createElement("span", { className: "label" }, u.get("gui:laddertoptierdemotions")),
                            R.createElement("span", { className: "label" }, F(n.nextTopTierDemoteTime)),
                          ),
                        void 0 !== n.nextTopTierPromoteTime &&
                          R.createElement(
                            "div",
                            { className: "item" },
                            R.createElement("span", { className: "label" }, u.get("gui:laddertoptierpromotions")),
                            R.createElement("span", { className: "label" }, F(n.nextTopTierPromoteTime)),
                          ),
                        void 0 !== n.lockTime &&
                          R.createElement(
                            "div",
                            { className: "item" },
                            R.createElement("span", { className: "label" }, u.get("gui:ladderseasonlock")),
                            R.createElement("span", { className: "value" }, D(n.lockTime)),
                          ),
                      )
                    : R.createElement(j, {
                        players: e,
                        highlightPlayer: t,
                        ladderType: l?.type ?? o?.[0].type,
                        region: c,
                        season: a,
                        showPoints: x,
                        showMmr: C,
                        strings: u,
                        hasPrevPage: i,
                        hasNextPage: r,
                        disabled: h,
                        onFirstPageClick: d,
                        onPrevPageClick: g,
                        onNextPageClick: p,
                        onLastPageClick: m,
                      }),
                ),
              );
            },
          ),
          (j = ({
            players: e,
            highlightPlayer: t,
            ladderType: a,
            region: n,
            season: o,
            showPoints: i,
            showMmr: r,
            strings: l,
            hasPrevPage: s,
            hasNextPage: c,
            disabled: h,
            onFirstPageClick: u,
            onPrevPageClick: d,
            onNextPageClick: g,
            onLastPageClick: p,
          }) =>
            R.createElement(
              "div",
              { className: "ladder-table" },
              R.createElement(
                "table",
                null,
                R.createElement(
                  "thead",
                  null,
                  R.createElement(
                    "tr",
                    null,
                    R.createElement("th", { className: "player-rank" }, "#"),
                    R.createElement("th", { className: "player-rank-icon" }, l.get("GUI:Rank")),
                    R.createElement("th", { className: "player-name" }, l.get("GUI:Name")),
                    i && R.createElement("th", { className: "player-points" }, l.get("GUI:Points")),
                    r && R.createElement("th", { className: "player-mmr" }, l.get("GUI:MMR")),
                    R.createElement("th", { className: "player-wins" }, l.get("GUI:NumberWins")),
                    R.createElement("th", { className: "player-losses" }, l.get("GUI:NumberLosses")),
                  ),
                ),
                R.createElement(
                  "tbody",
                  null,
                  e.map((s) =>
                    R.createElement(
                      "tr",
                      {
                        key: s.name,
                        className: P.default({
                          selected: t?.toLowerCase() === s.name.toLowerCase(),
                          disabled: void 0 === s.points && !s.wins && !s.losses && !s.draws,
                        }),
                      },
                      R.createElement("td", { className: "player-rank" }, s.rank),
                      R.createElement(
                        "td",
                        { className: "player-rank-icon" },
                        R.createElement(m.RankIndicator, { playerProfile: s, strings: l }),
                      ),
                      R.createElement(
                        "td",
                        { className: "player-name" },
                        (() => {
                          var e,
                            t,
                            i,
                            r =
                              n && a && o === f.WLadderService.CURRENT_SEASON
                                ? ((e = s.name),
                                  (i = a),
                                  (t = n).leaderboardUrl ? `${t.leaderboardUrl}/player/${t.id}/${i}/` + e : void 0)
                                : void 0;
                          return r
                            ? R.createElement("a", { href: r, target: "_blank", rel: "noopener" }, s.name)
                            : s.name;
                        })(),
                      ),
                      i && R.createElement("td", { className: "player-points" }, s.points),
                      r && R.createElement("td", { className: "player-mmr" }, s.mmr),
                      R.createElement("td", { className: "player-wins" }, s.wins),
                      R.createElement("td", { className: "player-losses" }, s.losses ?? 0),
                    ),
                  ),
                ),
              ),
              (s || c) &&
                R.createElement(
                  "div",
                  { className: "pagination" },
                  R.createElement("button", { className: "first-page", disabled: !s || h, onClick: u }, "<<"),
                  R.createElement("button", { className: "prev-page", disabled: !s || h, onClick: d }, "<"),
                  R.createElement("button", { className: "next-page", disabled: !c || h, onClick: g }, ">"),
                  R.createElement("button", { className: "last-page", disabled: !c || h, onClick: p }, ">>"),
                ),
            )));
      },
    };
  },
);
