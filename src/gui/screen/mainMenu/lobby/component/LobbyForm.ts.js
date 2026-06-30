// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/component/LobbyForm ===
// deps: ["react","classnames","gui/screen/mainMenu/lobby/component/viewmodel/lobby","gui/component/Slider","gui/component/Chat","gui/component/CountrySelect","gui/component/ColorSelect","gui/component/PingIndicator","game/gameopts/GameOpts","gui/component/Image","gui/component/StartPosSelect","gui/component/TeamSelect","game/gameopts/constants","gui/component/Select","gui/component/Option","util/typeGuard","gui/screen/mainMenu/lobby/component/RankIndicator"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/component/LobbyForm",
  [
    "react",
    "classnames",
    "gui/screen/mainMenu/lobby/component/viewmodel/lobby",
    "gui/component/Slider",
    "gui/component/Chat",
    "gui/component/CountrySelect",
    "gui/component/ColorSelect",
    "gui/component/PingIndicator",
    "game/gameopts/GameOpts",
    "gui/component/Image",
    "gui/component/StartPosSelect",
    "gui/component/TeamSelect",
    "game/gameopts/constants",
    "gui/component/Select",
    "gui/component/Option",
    "util/typeGuard",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
  ],
  function (e, t) {
    "use strict";
    var l, n, c, o, h, a, u, d, g, i, p, m, f, y, T, v, b, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
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
          i = e;
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
        ((r = class extends l.default.Component {
          constructor() {
            (super(...arguments),
              (this.onPlayerSelect = (e, t) => {
                let i, r;
                (e.match(/^\d+$/) ? (i = Number(e)) : ((i = c.SlotOccupation.Occupied), (r = g.AiDifficulty[e])),
                  this.props.onSlotChange(i, t, r));
              }));
          }
          render() {
            let { strings: e, lobbyType: t, mpDialogSettings: i } = this.props;
            var r = t === c.LobbyType.Singleplayer || t === c.LobbyType.MultiplayerHost,
              s = t === c.LobbyType.Singleplayer;
            let a = this.props;
            return l.default.createElement(
              "div",
              {
                className: n.default("lobby-form", {
                  "lobby-form-sp": s,
                  "lobby-form-server-sel": a.selectedGameServer,
                }),
              },
              a.selectedGameServer &&
                l.default.createElement(
                  "div",
                  { className: "game-server" },
                  l.default.createElement("span", { className: "label" }, e.get("TS:ServerLabel")),
                  l.default.createElement(
                    y.Select,
                    { initialValue: a.selectedGameServer, disabled: !0 },
                    l.default.createElement(T.Option, { label: a.selectedGameServer, value: a.selectedGameServer }),
                  ),
                ),
              l.default.createElement(
                "div",
                { className: "player-slots" },
                l.default.createElement(
                  "div",
                  { className: "player-slot player-slot-header" },
                  l.default.createElement("div", { className: "player-header-players" }, e.get("GUI:Players")),
                  l.default.createElement("div", { className: "player-header-side" }, e.get("GUI:Side")),
                  l.default.createElement("div", { className: "player-header-color" }, e.get("GUI:Color")),
                  l.default.createElement("div", { className: "player-header-position" }, e.get("GUI:StartPosition")),
                  l.default.createElement("div", { className: "player-header-team" }, e.get("GUI:Team")),
                ),
                a.playerSlots.map((e, t) => this.renderPlayerSlot(a, e, t)),
              ),
              l.default.createElement(
                "div",
                { className: "game-options" },
                l.default.createElement(
                  "div",
                  { className: "game-options-left" },
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:HostCBoxShortGame") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "shortGame",
                        checked: a.shortGame,
                        onChange: (e) => this.props.onToggleShortGame(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:ShortGame")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:HostCBoxRedeploys") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "mcvRepacks",
                        checked: a.mcvRepacks,
                        onChange: (e) => this.props.onToggleMcvRepacks(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:MCVRepacks")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:HostCBoxCrates") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "cratesAppear",
                        checked: a.cratesAppear,
                        onChange: (e) => this.props.onToggleCratesAppear(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:CratesAppear")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:HostCBoxSWAllowed") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "superWeapons",
                        checked: a.superWeapons,
                        onChange: (e) => this.props.onToggleSuperWeapons(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:SuperWeaponsAllowed")),
                    ),
                  ),
                  void 0 !== a.hostTeams &&
                    l.default.createElement(
                      "div",
                      { "data-r-tooltip": e.get("STT:HostCBoxHostTeams") },
                      l.default.createElement(
                        "label",
                        null,
                        l.default.createElement("input", {
                          type: "checkbox",
                          name: "hostTeams",
                          checked: a.hostTeams,
                          onChange: (e) => this.props.onToggleHostTeams?.(e.target.checked),
                          disabled: !r,
                        }),
                        " ",
                        l.default.createElement("span", null, e.get("GUI:HostTeams")),
                      ),
                    ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:DestroyableBridges") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "destBridges",
                        checked: a.destroyableBridges,
                        onChange: (e) => this.props.onToggleDestroyableBridges?.(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:DestroyableBridges")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:MultiEngineer", a.multiEngineerCount) },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "multiEngineer",
                        checked: a.multiEngineer,
                        onChange: (e) => this.props.onToggleMultiEngineer?.(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:MultiEngineer")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:InstantCapture") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "instantCapture",
                        checked: a.instantCapture || a.multiEngineer,
                        onChange: (e) => this.props.onToggleInstantCapture?.(e.target.checked),
                        disabled: !r || a.multiEngineer,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:InstantCapture")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:NoDogEngiKills") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "noDogEngiKills",
                        checked: a.noDogEngiKills,
                        onChange: (e) => this.props.onToggleNoDogEngiKills?.(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:NoDogEngiKills")),
                    ),
                  ),
                  l.default.createElement(
                    "div",
                    { "data-r-tooltip": e.get("STT:DelayedOils") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "delayedOils",
                        checked: a.delayedOils,
                        onChange: (e) => this.props.onToggleDelayedOils?.(e.target.checked),
                        disabled: !r,
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:DelayedOils")),
                    ),
                  ),
                ),
                l.default.createElement(
                  "div",
                  { className: "game-options-right" + (r ? "" : " all-disabled") },
                  l.default.createElement(
                    "div",
                    { className: "slider-item" },
                    l.default.createElement("span", { className: "label" }, e.get("GUI:GameSpeed")),
                    l.default.createElement(o.Slider, {
                      name: "gameSpeed",
                      min: 0,
                      max: 6,
                      value: "" + a.gameSpeed,
                      disabled: !r,
                      "data-r-tooltip": e.get("STT:HostSliderSpeed"),
                      onChange: (e) => this.props.onChangeGameSpeed(Number(e.target.value)),
                    }),
                  ),
                  l.default.createElement(
                    "div",
                    { className: "slider-item" },
                    l.default.createElement("span", { className: "label" }, e.get("GUI:Credits")),
                    l.default.createElement(o.Slider, {
                      name: "credits",
                      min: i.minMoney,
                      max: i.maxMoney,
                      step: i.moneyIncrement,
                      value: "" + a.credits,
                      "data-r-tooltip": e.get("STT:HostSliderCredits"),
                      onChange: (e) => this.props.onChangeCredits(Number(e.target.value)),
                      disabled: !r,
                    }),
                  ),
                  l.default.createElement(
                    "div",
                    { className: "slider-item" },
                    l.default.createElement("span", { className: "label" }, e.get("GUI:UnitCount")),
                    l.default.createElement(o.Slider, {
                      name: "unitCount",
                      min: i.minUnitCount,
                      max: i.maxUnitCount,
                      value: "" + a.unitCount,
                      "data-r-tooltip": e.get("STT:HostSliderUnit"),
                      onChange: (e) => this.props.onChangeUnitCount(Number(e.target.value)),
                      disabled: !r,
                    }),
                  ),
                  l.default.createElement(
                    "div",
                    { className: "checkbox-item", "data-r-tooltip": e.get("STT:HostCBoxBuildOffAlly") },
                    l.default.createElement(
                      "label",
                      null,
                      l.default.createElement("input", {
                        type: "checkbox",
                        name: "buildOffAlly",
                        checked: a.buildOffAlly,
                        disabled: !r,
                        onChange: (e) => this.props.onToggleBuildOffAlly(e.target.checked),
                      }),
                      " ",
                      l.default.createElement("span", null, e.get("GUI:BuildOffAlly")),
                    ),
                  ),
                ),
              ),
              void 0 !== this.props.messages &&
                void 0 !== this.props.localUsername &&
                this.props.onSendMessage &&
                l.default.createElement(h.Chat, {
                  messages: this.props.messages,
                  localUsername: this.props.localUsername,
                  channels: this.props.channels ?? [],
                  chatHistory: this.props.chatHistory,
                  onSendMessage: this.props.onSendMessage,
                  tooltips: {
                    button: e.get("STT:EmoteButton"),
                    input: r ? e.get("STT:HostEditInput") : e.get("STT:GuestEditInput"),
                    output: r ? e.get("STT:HostEditOutput") : e.get("STT:GuestEditOutput"),
                  },
                  strings: e,
                }),
            );
          }
          renderPlayerSlot(e, t, i) {
            const r = e.strings;
            var s = e.lobbyType === c.LobbyType.Singleplayer || e.lobbyType === c.LobbyType.MultiplayerHost;
            return t
              ? l.default.createElement(
                  "div",
                  { className: "player-slot", key: "playerslot" + i },
                  t.type === c.SlotType.Player
                    ? l.default.createElement(b.RankIndicator, { playerProfile: t.playerProfile, strings: r })
                    : l.default.createElement(b.RankIndicator, { playerProfile: void 0, strings: r }),
                  l.default.createElement(d.PingIndicator, {
                    ping: t.type === c.SlotType.Player ? t.ping : void 0,
                    strings: r,
                  }),
                  l.default.createElement(
                    "div",
                    { className: "player-status", "data-r-tooltip": r.get("STT:HostPictureAcceptance") },
                    this.renderPlayerStatus(t.status),
                  ),
                  this.renderPlayerSelect(t, i, e.lobbyType),
                  l.default.createElement(a.CountrySelect, {
                    countryUiNames: e.countryUiNames,
                    countryUiTooltips: e.countryUiTooltips,
                    country: t.country,
                    availableCountries: e.availablePlayerCountries,
                    disabled:
                      (i !== e.activeSlotIndex && (!s || t.type !== c.SlotType.Ai)) ||
                      t.type === c.SlotType.Observer ||
                      (t.status === c.PlayerStatus.Ready && t.type !== c.SlotType.Ai),
                    strings: e.strings,
                    onSelect: (e) => this.props.onCountrySelect(e, i),
                  }),
                  t.type !== c.SlotType.Observer
                    ? l.default.createElement(
                        l.default.Fragment,
                        null,
                        l.default.createElement(u.ColorSelect, {
                          color: t.color,
                          availableColors: e.availablePlayerColors,
                          disabled:
                            (i !== e.activeSlotIndex && (!s || t.type !== c.SlotType.Ai)) ||
                            (t.status === c.PlayerStatus.Ready && t.type !== c.SlotType.Ai),
                          strings: e.strings,
                          onSelect: (e) => this.props.onColorSelect(e, i),
                        }),
                        l.default.createElement(p.StartPosSelect, {
                          disabled: e.hostTeams
                            ? !s || t.occupation !== c.SlotOccupation.Occupied
                            : (i !== e.activeSlotIndex && (!s || t.type !== c.SlotType.Ai)) ||
                              (t.status === c.PlayerStatus.Ready && t.type !== c.SlotType.Ai),
                          startPos: t.startPos,
                          availableStartPositions: e.availableStartPositions,
                          onSelect: (e) => this.props.onStartPosSelect(e, i),
                          strings: e.strings,
                        }),
                        l.default.createElement(m.TeamSelect, {
                          disabled:
                            !e.teamsAllowed ||
                            (e.hostTeams
                              ? !s || t.occupation !== c.SlotOccupation.Occupied
                              : (i !== e.activeSlotIndex && (!s || t.type !== c.SlotType.Ai)) ||
                                (t.status === c.PlayerStatus.Ready && t.type !== c.SlotType.Ai)),
                          teamId: e.teamsAllowed ? t.team : f.NO_TEAM_ID,
                          required: e.teamsRequired,
                          maxTeams: e.maxTeams,
                          onSelect: (e) => this.props.onTeamSelect(e, i),
                          strings: e.strings,
                        }),
                      )
                    : null,
                )
              : l.default.createElement("div", { className: "player-slot", key: "playerslot" + i });
          }
          renderPlayerStatus(e) {
            return e === c.PlayerStatus.Host
              ? l.default.createElement(i.Image, { src: "wolhost.pcx" })
              : e === c.PlayerStatus.Ready
                ? l.default.createElement(i.Image, { src: "wolacpt.pcx" })
                : null;
          }
          renderPlayerSelect(i, t, e) {
            let r = e === c.LobbyType.Singleplayer;
            var s = r || e === c.LobbyType.MultiplayerHost;
            if (t === this.props.activeSlotIndex || (s && 0 === t))
              return l.default.createElement("input", {
                type: "text",
                className: "player-name",
                value: i.name,
                readOnly: !0,
              });
            let a = this.props.strings,
              n = new Map()
                .set(c.SlotOccupation.Occupied, i.name || "")
                .set(c.SlotOccupation.Open, a.get(i.type === c.SlotType.Observer ? "GUI:OpenObserver" : "GUI:Open"))
                .set(c.SlotOccupation.Closed, r ? a.get("GUI:None") : a.get("GUI:Closed")),
              o = i.occupation;
            return (
              i.occupation === c.SlotOccupation.Occupied &&
                i.type === c.SlotType.Ai &&
                (n.delete(c.SlotOccupation.Occupied), (o = g.AiDifficulty[i.aiDifficulty])),
              i.type !== c.SlotType.Observer &&
                this.props.availableAiNames.forEach((e, t) => {
                  n.set(g.AiDifficulty[t], a.get(e));
                }),
              l.default.createElement(
                y.Select,
                {
                  initialValue: "" + o,
                  disabled: !s,
                  onSelect: (e) => this.onPlayerSelect(e, t),
                  className: "player-name",
                  tooltip: r ? a.get("STT:SkirmishComboAiPlayer") : a.get("STT:HostComboPlayer"),
                },
                [...n]
                  .map(([t, e]) =>
                    (t === c.SlotOccupation.Occupied && i.occupation !== c.SlotOccupation.Occupied) ||
                    (t === c.SlotOccupation.Open && r)
                      ? null
                      : l.default.createElement(T.Option, {
                          key: t,
                          value: "" + t,
                          label: e,
                          tooltip: r
                            ? (() => {
                                let e;
                                return (
                                  (e =
                                    t === c.SlotOccupation.Closed
                                      ? "STT:PlayerNone"
                                      : f.aiUiTooltips.get(g.AiDifficulty[t])),
                                  e ? a.get(e) : void 0
                                );
                              })()
                            : void 0,
                        }),
                  )
                  .filter(v.isNotNullOrUndefined),
              )
            );
          }
        }),
          e("LobbyForm", r));
      },
    };
  },
);
