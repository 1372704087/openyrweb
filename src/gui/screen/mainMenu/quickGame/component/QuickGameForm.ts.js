// === Reconstructed SystemJS module: gui/screen/mainMenu/quickGame/component/QuickGameForm ===
// deps: ["classnames","gui/component/Image","gui/component/ButtonSelect","gui/component/ColorSelect","gui/component/CountrySelect","gui/component/Option","react","gui/screen/mainMenu/lobby/component/RankIndicator","network/ladder/wladderConfig","gui/screen/mainMenu/quickGame/component/QuickGameChat"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/quickGame/component/QuickGameForm",
  [
    "classnames",
    "gui/component/Image",
    "gui/component/ButtonSelect",
    "gui/component/ColorSelect",
    "gui/component/CountrySelect",
    "gui/component/Option",
    "react",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
    "network/ladder/wladderConfig",
    "gui/screen/mainMenu/quickGame/component/QuickGameChat",
  ],
  function (e, t) {
    "use strict";
    var y, T, v, b, S, w, E, C, x, O;
    t && t.id;
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
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
      ],
      execute: function () {
        e("QuickGameForm", (t) => {
          let {
            strings: e,
            disabled: i,
            playerName: r,
            playerProfile: s,
            unrankedEnabled: a,
            ranked: n,
            type: o,
            availableTypes: l,
            enabledTypes: c,
            chatProps: h,
            onRankedChange: u,
            onTypeChange: d,
            partyState: g,
            partySize: p,
            noInvites: m,
            onNoInvitesChange: f,
          } = t;
          return E.createElement(
            "div",
            { className: "qm-form" },
            E.createElement(
              "div",
              { className: "qm-top" },
              E.createElement(
                "div",
                { className: "opts" },
                E.createElement(
                  "div",
                  { className: "item qm-game-type-item" },
                  E.createElement(
                    "label",
                    null,
                    E.createElement("span", { className: "label" }, e.get("GUI:QuickMatchGameMode")),
                    E.createElement(
                      "div",
                      { className: "qm-game-type" },
                      E.createElement(
                        v.ButtonSelect,
                        { initialValue: o, onSelect: (e) => d(e), disabled: i },
                        l.map((e) =>
                          E.createElement(w.Option, {
                            value: e,
                            label: e,
                            key: e,
                            disabled: !c.includes(e) || (2 === p && e === x.LadderQueueType.Solo1v1),
                          }),
                        ),
                      ),
                      E.createElement(
                        v.ButtonSelect,
                        {
                          initialValue: String(Number(n)),
                          onSelect: (e) => {
                            u(Boolean(Number(e)));
                          },
                          disabled: i,
                        },
                        E.createElement(w.Option, { value: "1", label: e.get("GUI:Ranked") }),
                        E.createElement(w.Option, { value: "0", disabled: !a, label: e.get("GUI:Unranked") }),
                      ),
                    ),
                  ),
                ),
                E.createElement(
                  "div",
                  { className: "item" },
                  E.createElement(
                    "label",
                    null,
                    E.createElement("span", { className: "label" }, e.get("GUI:PreferredCountry")),
                    E.createElement(S.CountrySelect, {
                      countryUiNames: t.countryUiNames,
                      countryUiTooltips: t.countryUiTooltips,
                      country: t.country,
                      availableCountries: t.availableCountries,
                      disabled: i,
                      strings: t.strings,
                      onSelect: (e) => t.onCountrySelect(e),
                    }),
                  ),
                ),
                E.createElement(
                  "div",
                  { className: "item" },
                  E.createElement(
                    "label",
                    null,
                    E.createElement("span", { className: "label" }, e.get("GUI:PreferredColor")),
                    E.createElement(b.ColorSelect, {
                      color: t.color,
                      availableColors: t.availableColors,
                      disabled: i,
                      strings: t.strings,
                      onSelect: (e) => t.onColorSelect(e),
                    }),
                  ),
                ),
                g && 0 < g.members.length
                  ? E.createElement(
                      "div",
                      { className: "item" },
                      E.createElement(
                        "label",
                        null,
                        E.createElement("span", { className: "label" }, e.get("GUI:CurrentParty")),
                        E.createElement(
                          "div",
                          { className: "party-info" },
                          E.createElement(
                            "div",
                            { className: "party-members" },
                            E.createElement("span", null, g.members.map((e) => e.name).join(", ")),
                          ),
                        ),
                      ),
                    )
                  : E.createElement(
                      "div",
                      { className: "item party-noinvites" },
                      E.createElement(
                        "label",
                        null,
                        E.createElement("span", { className: "label" }, e.get("GUI:PartyNoInvites")),
                        E.createElement("input", {
                          type: "checkbox",
                          checked: m,
                          onChange: (e) => f?.(e.target.checked),
                          disabled: i,
                        }),
                      ),
                    ),
              ),
              E.createElement(
                "fieldset",
                { className: "qm-profile" },
                E.createElement("legend", null, s?.name ?? r),
                void 0 === s?.rank
                  ? s
                    ? E.createElement(
                        "div",
                        { className: "item placement" },
                        e.get("GUI:LadderPlacement", s.placementMatchesLeft),
                      )
                    : E.createElement("div", null)
                  : E.createElement(
                      E.Fragment,
                      null,
                      E.createElement(
                        "div",
                        { className: "player-rank" },
                        E.createElement(
                          "div",
                          { className: "rank-name" },
                          E.createElement(C.RankIndicator, { playerProfile: s, strings: e }),
                          " ",
                          e.get(C.RANK_LABELS.get(s.rankType)),
                        ),
                        E.createElement("div", { className: "rank-number" }, e.get("GUI:Rank"), " ", s.rank),
                      ),
                      s.promotionProgress &&
                        E.createElement(
                          "div",
                          {
                            className: y.default("item", "promo-progress", { demotion: s.promotionProgress.demotion }),
                          },
                          E.createElement("span", { className: "label" }, e.get("GUI:LadderPromoProgress")),
                          E.createElement(
                            "span",
                            { className: "value" },
                            E.createElement(
                              "div",
                              { className: "next-rank" },
                              e.get(C.RANK_LABELS.get(s.promotionProgress.rankType)),
                              s.promotionProgress.demotion
                                ? E.createElement("span", { className: "demotion-indicator" }, "▼")
                                : E.createElement("span", { className: "promotion-indicator" }, "▲"),
                            ),
                            E.createElement("progress", { value: s.promotionProgress.progress, max: 1 }),
                          ),
                        ),
                      E.createElement("hr", null),
                      E.createElement(
                        "div",
                        { className: "item" },
                        E.createElement("span", { className: "label" }, e.get("GUI:LadderWins")),
                        E.createElement("span", { className: "value" }, s.wins ?? e.get("GUI:UnknownStats")),
                      ),
                      void 0 !== s.points &&
                        E.createElement(
                          "div",
                          { className: "item" },
                          E.createElement("span", { className: "label" }, e.get("GUI:LadderPoints")),
                          E.createElement("span", { className: "value" }, s.points),
                        ),
                      void 0 !== s.bonusPool &&
                        E.createElement(
                          "div",
                          { className: "item" },
                          E.createElement("span", { className: "label" }, e.get("GUI:ProfileBonusPool")),
                          E.createElement("span", { className: "value" }, s.bonusPool),
                        ),
                      void 0 !== s.mmr &&
                        E.createElement(
                          "div",
                          { className: "item" },
                          E.createElement("span", { className: "label" }, e.get("GUI:ProfileMMR")),
                          E.createElement(
                            "span",
                            { className: "value" },
                            s.mmr,
                            void 0 !== s.provisionalMmr &&
                              E.createElement(
                                "span",
                                { className: "info", title: e.get("gui:profileprovmmr") + " " + s.provisionalMmr },
                                E.createElement(T.Image, { src: "info.png" }),
                              ),
                          ),
                        ),
                    ),
              ),
            ),
            E.createElement("div", { className: "qm-bottom" }, E.createElement(O.QuickGameChat, { ...h })),
          );
        });
      },
    };
  },
);
