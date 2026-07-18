// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/SkirmishScreen ===
// deps: ["@puzzl/core/lib/async/Task","network/gameopt/SlotInfo","game/gameopts/GameOpts","game/gameopts/constants","gui/screen/mainMenu/lobby/component/LobbyForm","gui/screen/mainMenu/lobby/component/viewmodel/lobby","gui/screen/mainMenu/ScreenType","util/disposable/CompositeDisposable","gui/jsx/jsx","gui/jsx/HtmlView","engine/ResourceLoader","@puzzl/core/lib/async/cancellation","gui/screen/mainMenu/lobby/MapPreviewRenderer","util/array","LocalPrefs","util/typeGuard","gui/screen/mainMenu/lobby/PreferredHostOpts","gui/screen/mainMenu/MainMenuScreen","data/MapFile","engine/MapDigest","gui/screen/mainMenu/MainMenuRoute","engine/sound/Music","network/gameopt/Parser","network/gameopt/Serializer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/SkirmishScreen",
  [
    "@puzzl/core/lib/async/Task",
    "network/gameopt/SlotInfo",
    "game/gameopts/GameOpts",
    "game/gameopts/constants",
    "gui/screen/mainMenu/lobby/component/LobbyForm",
    "gui/screen/mainMenu/lobby/component/viewmodel/lobby",
    "gui/screen/mainMenu/ScreenType",
    "util/disposable/CompositeDisposable",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "engine/ResourceLoader",
    "@puzzl/core/lib/async/cancellation",
    "gui/screen/mainMenu/lobby/MapPreviewRenderer",
    "util/array",
    "LocalPrefs",
    "util/typeGuard",
    "gui/screen/mainMenu/lobby/PreferredHostOpts",
    "gui/screen/mainMenu/MainMenuScreen",
    "data/MapFile",
    "engine/MapDigest",
    "gui/screen/mainMenu/MainMenuRoute",
    "engine/sound/Music",
    "network/gameopt/Parser",
    "network/gameopt/Serializer",
  ],
  function (e, t) {
    "use strict";
    var i, y, T, v, r, n, s, h, a, o, l, c, u, d, b, g, S, p, m, w, f, E, C, x, O;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
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
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          f = e;
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
      ],
      execute: function () {
        ((O = class extends p.MainMenuScreen {
          constructor(e, t, i, r, s, a, n, o, l, c) {
            (super(),
              (this.rootController = e),
              (this.errorHandler = t),
              (this.messageBoxApi = i),
              (this.strings = r),
              (this.rules = s),
              (this.jsxRenderer = a),
              (this.mapFileLoader = n),
              (this.mapList = o),
              (this.gameModes = l),
              (this.localPrefs = c),
              (this.title = this.strings.get("GUI:SkirmishGame")),
              (this.musicType = E.MusicType.Intro),
              (this.playerName = "Player 1"),
              (this.hostObserver = !1),
              (this.savedHostCountryId = void 0),
              (this.disposables = new h.CompositeDisposable()));
          }
          get backgroundImageName() {
            return "mnscrnlcoopgamesetup.shp";
          }
          onEnter() {
            (this.controller.toggleMainVideo(!1), (this.lobbyForm = void 0), this.initFormModel(), this.createGame());
          }
          async createGame() {
            try {
              await this.initOptions();
            } catch (e) {
              return void this.handleError(
                e,
                e instanceof l.DownloadError
                  ? this.strings.get("TXT_DOWNLOAD_FAILED")
                  : this.strings.get("WOL:MatchErrorCreatingGame"),
              );
            }
            (this.updateMapPreview(),
              this.updateFormModel(),
              this.controller.toggleSidebarPreview(!0),
              this.initView());
          }
          onViewportChange() {}
          onUnstack(a) {
            if (a) {
              let t = a.gameMode.id !== this.gameOpts.gameMode;
              this.gameOpts.gameMode = a.gameMode.id;
              let i = this.mapList.getByName(a.mapName),
                r = a.changedMapFile ?? this.currentMapFile;
              this.currentMapFile = r;
              var n = d.findIndexReverse(
                  this.slotsInfo,
                  (e) => e.type === y.SlotType.Ai || e.type === y.SlotType.Player || e.type === y.SlotType.Open,
                ),
                o = Math.max(0, n + 1 - i.maxSlots);
              for (let e = 0; e < o; e++)
                ((this.slotsInfo[n - e].type = y.SlotType.Closed), (this.gameOpts.aiPlayers[n - e] = void 0));
              let s = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
              ([...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers].forEach((e) => {
                e &&
                  (e.startPos > i.maxSlots - 1 && (e.startPos = v.RANDOM_START_POS),
                  t && (e.teamId = s.alliesAllowed && s.mustAlly ? 0 : v.NO_TEAM_ID));
              }),
                this.applyGameOption((e) => {
                  ((e.mapName = i.fileName),
                    (e.mapDigest = w.MapDigest.compute(r)),
                    (e.mapSizeBytes = r.getSize()),
                    (e.mapTitle = i.getFullMapTitle(this.strings)),
                    (e.maxSlots = i.maxSlots),
                    (e.mapOfficial = i.official));
                }),
                this.localPrefs.setItem(b.StorageKey.LastMap, i.fileName),
                this.localPrefs.setItem(b.StorageKey.LastMode, String(a.gameMode.id)),
                this.saveBotSettings());
            }
            (this.updateMapPreview(), this.initView());
          }
          async onStack() {
            await this.unrender();
          }
          initView() {
            (this.initLobbyForm(),
              this.refreshSidebarButtons(),
              this.refreshSidebarMpText(),
              this.controller.showSidebarButtons());
          }
          async initOptions() {
            var e = this.localPrefs.getItem(b.StorageKey.PreferredGameOpts),
              t = this.localPrefs.getItem(b.StorageKey.LastPlayerCountry),
              i = this.localPrefs.getItem(b.StorageKey.LastPlayerColor),
              r = this.localPrefs.getItem(b.StorageKey.LastPlayerStartPos),
              s = this.localPrefs.getItem(b.StorageKey.LastPlayerTeam),
              a = this.localPrefs.getItem(b.StorageKey.LastMap),
              n = this.localPrefs.getItem(b.StorageKey.LastMode),
              o = this.localPrefs.getItem(b.StorageKey.LastBots),
              P = this.localPrefs.getItem(b.StorageKey.LastHostObserver);
            let l = a ? this.mapList.getByName(a) : void 0,
              c = l && n && this.gameModes.hasId(Number(n)) ? Number(n) : 1,
              h = this.gameModes.getById(c),
              u;
            u = l?.gameModes.find((e) => e.mapFilter === h.mapFilter)
              ? l
              : ((c = 1),
                (h = this.gameModes.getById(c)),
                this.mapList.getAll().find((e) => e.gameModes.find((e) => h.mapFilter === e.mapFilter)));
            let d = (this.currentMapFile = await this.mapFileLoader.load(u.fileName)),
              g = new S.PreferredHostOpts();
            e ? g.unserialize(e) : g.applyMpDialogSettings(this.rules.mpDialogSettings);
            let p = h.mpDialogSettings,
              m = T.AiDifficulty.Medium,
              f = o ? new C.Parser().parseAiOpts(o) : void 0;
            (f && this.sanitizeLastBotSettings(f, i, r, u.maxSlots, p),
              (this.gameOpts = {
                gameMode: c,
                shortGame: g.shortGame,
                mcvRepacks: g.mcvRepacks,
                cratesAppear: g.cratesAppear,
                superWeapons: g.superWeapons,
                gameSpeed: g.gameSpeed,
                credits: g.credits,
                unitCount: g.unitCount,
                buildOffAlly: g.buildOffAlly,
                destroyableBridges: g.destroyableBridges,
                multiEngineer: g.multiEngineer,
                noDogEngiKills: g.noDogEngiKills,
                instantCapture: g.instantCapture,
                delayedOils: g.delayedOils,
                humanPlayers: [
                  {
                    name: this.playerName,
                    countryId:
                      void 0 !== t && Number(t) < this.getAvailablePlayerCountries().length
                        ? Number(t)
                        : v.RANDOM_COUNTRY_ID,
                    colorId:
                      void 0 !== i && Number(i) < this.getAvailablePlayerColors().length
                        ? Number(i)
                        : v.RANDOM_COLOR_ID,
                    startPos:
                      void 0 !== r && Number(r) < this.getAvailableStartPositions(u.maxSlots).length
                        ? Number(r)
                        : v.RANDOM_START_POS,
                    teamId:
                      void 0 !== s && p.alliesAllowed && Number(s) < 4 ? Number(s) : p.mustAlly ? 0 : v.NO_TEAM_ID,
                  },
                ],
                aiPlayers: [
                  ...new Array(8).fill(void 0).map((e, t) => {
                    if (!(t > u.maxSlots - 1)) {
                      var i = t === 1 ? (f ? f[1]?.difficulty : m) : f?.[t]?.difficulty;
                      if (void 0 !== i)
                        return {
                          countryId: f?.[t]?.countryId ?? v.RANDOM_COUNTRY_ID,
                          colorId: f?.[t]?.colorId ?? v.RANDOM_COLOR_ID,
                          startPos: f?.[t]?.startPos ?? v.RANDOM_START_POS,
                          teamId: f?.[t]?.teamId ?? (p.mustAlly ? 3 : v.NO_TEAM_ID),
                          difficulty: i,
                        };
                    }
                  }),
                ],
                mapName: u.fileName,
                mapDigest: w.MapDigest.compute(d),
                mapSizeBytes: d.getSize(),
                mapTitle: u.getFullMapTitle(this.strings),
                maxSlots: u.maxSlots,
                mapOfficial: u.official,
              }),
              (this.slotsInfo = [
                { type: y.SlotType.Player, name: this.playerName },
                ...this.gameOpts.aiPlayers
                  .slice(1)
                  .map((e) => (e ? { type: y.SlotType.Ai, difficulty: e.difficulty } : { type: y.SlotType.Closed })),
              ]),
              (this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId));
            (P === "ai" || this.gameOpts.aiPlayers[0]) && P !== "player"
              ? ((this.hostObserver = !0),
                this.gameOpts.aiPlayers[0] ??
                  (this.gameOpts.aiPlayers[0] = {
                    difficulty: T.AiDifficulty.Medium,
                    countryId: v.RANDOM_COUNTRY_ID,
                    colorId: v.RANDOM_COLOR_ID,
                    startPos: v.RANDOM_START_POS,
                    teamId: p.mustAlly ? 3 : v.NO_TEAM_ID,
                  }),
                (this.savedHostCountryId =
                  this.gameOpts.humanPlayers[0].countryId !== v.OBS_COUNTRY_ID
                    ? this.gameOpts.humanPlayers[0].countryId
                    : this.savedHostCountryId !== v.OBS_COUNTRY_ID
                      ? this.savedHostCountryId
                      : v.RANDOM_COUNTRY_ID),
                (this.gameOpts.humanPlayers[0].countryId = v.OBS_COUNTRY_ID),
                (this.slotsInfo[0] = {
                  type: y.SlotType.Ai,
                  difficulty: this.gameOpts.aiPlayers[0].difficulty,
                }))
              : P === "observer"
                ? ((this.hostObserver = !0),
                  (this.gameOpts.aiPlayers[0] = void 0),
                  (this.savedHostCountryId =
                    this.gameOpts.humanPlayers[0].countryId !== v.OBS_COUNTRY_ID
                      ? this.gameOpts.humanPlayers[0].countryId
                      : this.savedHostCountryId !== v.OBS_COUNTRY_ID
                        ? this.savedHostCountryId
                        : v.RANDOM_COUNTRY_ID),
                  (this.gameOpts.humanPlayers[0].countryId = v.OBS_COUNTRY_ID),
                  (this.slotsInfo[0].observer = !0))
                : ((this.hostObserver = !1), (this.gameOpts.aiPlayers[0] = void 0));
          }
          sanitizeLastBotSettings(e, t, i, r, s) {
            let a = 0;
            for (let c = 0; c < e.length; ++c) e[c] && (a++, a > (e[0] ? r : r - 1) && (e[c] = void 0));
            let n = void 0 !== t ? [Number(t)] : [],
              o = void 0 !== i ? [Number(i)] : [];
            for (var l of e)
              l &&
                (void 0 === l.difficulty || T.AiDifficulty[l.difficulty] || (l.difficulty = T.AiDifficulty.Easy),
                void 0 !== l.countryId &&
                  l.countryId >= this.getAvailablePlayerCountries().length &&
                  (l.countryId = v.RANDOM_COUNTRY_ID),
                void 0 !== l.colorId &&
                  l.colorId !== v.RANDOM_COUNTRY_ID &&
                  (l.colorId >= this.getAvailablePlayerColors().length || n.includes(l.colorId)
                    ? (l.colorId = v.RANDOM_COLOR_ID)
                    : n.push(l.colorId)),
                void 0 !== l.startPos &&
                  l.startPos !== v.RANDOM_START_POS &&
                  (l.startPos >= this.getAvailableStartPositions(r).length || o.includes(l.startPos)
                    ? (l.startPos = v.RANDOM_START_POS)
                    : o.push(l.startPos)),
                l.teamId !== v.NO_TEAM_ID
                  ? (4 <= l.teamId || !s.alliesAllowed) && (l.teamId = s.mustAlly ? 3 : v.NO_TEAM_ID)
                  : s.mustAlly && (l.teamId = 3));
          }
          handleError(e, t) {
            this.errorHandler.handle(e, t, () => {
              this.controller?.goToScreen(s.ScreenType.Home);
            });
          }
          getAvailablePlayerCountryRules() {
            return this.rules.getMultiplayerCountries();
          }
          getAvailablePlayerCountries() {
            return this.getAvailablePlayerCountryRules().map((e) => e.name);
          }
          getAvailablePlayerColors() {
            return [...this.rules.getMultiplayerColors().values()].map((e) => e.asHexString());
          }
          getAvailableStartPositions(e) {
            return new Array(e).fill(0).map((e, t) => t);
          }
          getSelectablePlayerColors(e) {
            let t = [];
            e.forEach((e) => {
              e && t.push(e.color);
            });
            let i = this.getAvailablePlayerColors();
            return [v.RANDOM_COLOR_NAME].concat(i.filter((e) => e && -1 === t.indexOf(e)));
          }
          getSelectableStartPositions(e, t) {
            let i = [];
            e.forEach((e) => {
              e && i.push(e.startPos);
            });
            let r = this.getAvailableStartPositions(t);
            return [v.RANDOM_START_POS].concat(r.filter((e) => !i.includes(e)));
          }
          initFormModel() {
            var e = this.rules.mpDialogSettings;
            this.formModel = {
              strings: this.strings,
              countryUiNames: new Map(
                [
                  [v.RANDOM_COUNTRY_NAME, v.RANDOM_COUNTRY_UI_NAME],
                  [v.OBS_COUNTRY_NAME, v.OBS_COUNTRY_UI_NAME],
                ].concat(this.getAvailablePlayerCountryRules().map((e) => [e.name, e.uiName])),
              ),
              countryUiTooltips: new Map(
                [
                  [v.RANDOM_COUNTRY_NAME, v.RANDOM_COUNTRY_UI_TOOLTIP],
                  [v.OBS_COUNTRY_NAME, v.OBS_COUNTRY_UI_TOOLTIP],
                ].concat(
                  this.getAvailablePlayerCountryRules()
                    .filter((e) => e.uiTooltip)
                    .map((e) => [e.name, e.uiTooltip]),
                ),
              ),
              availablePlayerCountries: [v.RANDOM_COUNTRY_NAME].concat(this.getAvailablePlayerCountries()),
              availablePlayerColors: [],
              availableStartPositions: [],
              maxTeams: 4,
              availableAiNames: v.aiUiNames,
              lobbyType: n.LobbyType.Singleplayer,
              mpDialogSettings: e,
              onCountrySelect: (e, t) => {
                (this.updatePlayerInfo(
                  this.getCountryIdByName(e),
                  this.getColorIdByName(this.formModel.playerSlots[t].color),
                  this.formModel.playerSlots[t].startPos,
                  this.formModel.playerSlots[t].team,
                  t,
                ),
                  this.updateFormModel());
              },
              onColorSelect: (e, t) => {
                (this.updatePlayerInfo(
                  this.getCountryIdByName(this.formModel.playerSlots[t].country),
                  this.getColorIdByName(e),
                  this.formModel.playerSlots[t].startPos,
                  this.formModel.playerSlots[t].team,
                  t,
                ),
                  this.updateFormModel());
              },
              onStartPosSelect: (e, t) => {
                this.updatePlayerInfo(
                  this.getCountryIdByName(this.formModel.playerSlots[t].country),
                  this.getColorIdByName(this.formModel.playerSlots[t].color),
                  e,
                  this.formModel.playerSlots[t].team,
                  t,
                );
              },
              onTeamSelect: (e, t) => {
                this.updatePlayerInfo(
                  this.getCountryIdByName(this.formModel.playerSlots[t].country),
                  this.getColorIdByName(this.formModel.playerSlots[t].color),
                  this.formModel.playerSlots[t].startPos,
                  e,
                  t,
                );
              },
              onSlotChange: (e, t, i) => {
                (this.changeSlotType(e, t, i), this.saveBotSettings());
              },
              onToggleShortGame: (t) => this.applyGameOption((e) => (e.shortGame = t)),
              onToggleMcvRepacks: (t) => this.applyGameOption((e) => (e.mcvRepacks = t)),
              onToggleCratesAppear: (t) => this.applyGameOption((e) => (e.cratesAppear = t)),
              onToggleSuperWeapons: (t) => this.applyGameOption((e) => (e.superWeapons = t)),
              onToggleBuildOffAlly: (t) => this.applyGameOption((e) => (e.buildOffAlly = t)),
              onToggleDestroyableBridges: (t) => this.applyGameOption((e) => (e.destroyableBridges = t)),
              onToggleMultiEngineer: (t) =>
                this.applyGameOption((e) => {
                  (e.multiEngineer = t) && (e.instantCapture = !0);
                }),
              onToggleNoDogEngiKills: (t) => this.applyGameOption((e) => (e.noDogEngiKills = t)),
              onToggleInstantCapture: (t) => this.applyGameOption((e) => (e.instantCapture = t)),
              onToggleDelayedOils: (t) => this.applyGameOption((e) => (e.delayedOils = t)),
              onChangeGameSpeed: (t) => this.applyGameOption((e) => (e.gameSpeed = t)),
              onChangeCredits: (t) => this.applyGameOption((e) => (e.credits = t)),
              onChangeUnitCount: (t) => this.applyGameOption((e) => (e.unitCount = t)),
              onPlayerNameChange: (e, t) => {
                (this.playerName = e),
                  this.gameOpts.humanPlayers[0] && (this.gameOpts.humanPlayers[0].name = e),
                  this.slotsInfo[0] && (this.slotsInfo[0].name = e),
                  this.updateFormModel();
              },
              activeSlotIndex: 0,
              teamsAllowed: !0,
              teamsRequired: !1,
              playerSlots: [],
              shortGame: !0,
              mcvRepacks: !0,
              cratesAppear: !0,
              superWeapons: !0,
              buildOffAlly: !0,
              destroyableBridges: !0,
              multiEngineer: !1,
              multiEngineerCount:
                Math.ceil((1 - this.rules.general.engineerCaptureLevel) / this.rules.general.engineerDamage) + 1,
              noDogEngiKills: !1,
              instantCapture: !0,
              delayedOils: !1,
              gameSpeed: 6,
              credits: e.money,
              unitCount: e.unitCount,
            };
          }
          applyGameOption(e) {
            (e(this.gameOpts),
              this.updateFormModel(),
              this.localPrefs.setItem(
                b.StorageKey.PreferredGameOpts,
                new S.PreferredHostOpts().applyGameOpts(this.gameOpts).serialize(),
              ));
          }
          changeSlotType(e, t, i) {
            var r;
            if (e === "player" && 0 === t) {
              this.hostObserver = !1;
              this.slotsInfo[0].type = y.SlotType.Player;
              delete this.slotsInfo[0].difficulty;
              delete this.slotsInfo[0].observer;
              this.gameOpts.aiPlayers[0] = void 0;
              this.gameOpts.humanPlayers[0].countryId = this.savedHostCountryId ?? v.RANDOM_COUNTRY_ID;
              this.localPrefs.setItem(b.StorageKey.LastHostObserver, "player");
              this.localPrefs.setItem(b.StorageKey.LastPlayerCountry, String(this.gameOpts.humanPlayers[0].countryId));
              this.updateFormModel();
              this.refreshSidebarButtons();
              return;
            }
            if (e === n.SlotOccupation.Observer) {
              if (0 === t) {
                this.hostObserver = !0;
                this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId;
                this.gameOpts.humanPlayers[0].countryId = v.OBS_COUNTRY_ID;
                (this.slotsInfo[0].type = y.SlotType.Player),
                  delete this.slotsInfo[0].difficulty,
                  delete this.slotsInfo[0].observer,
                  (this.gameOpts.aiPlayers[0] = void 0);
                this.localPrefs.setItem(b.StorageKey.LastHostObserver, "observer");
                this.localPrefs.setItem(b.StorageKey.LastPlayerCountry, String(this.savedHostCountryId));
                this.updateFormModel();
                this.refreshSidebarButtons();
                return;
              }
              this.slotsInfo[t].type = y.SlotType.Closed;
              this.slotsInfo[t].observer = !0;
              this.gameOpts.aiPlayers[t] = void 0;
              this.updateFormModel();
              return;
            }
            if (0 === t && !(e === n.SlotOccupation.Occupied && void 0 !== i))
              throw new Error("Cannot change slot type of host to non-player/observer");
            if (e === n.SlotOccupation.Occupied && void 0 !== i) {
              var s = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
              let a = this.slotsInfo[t];
              if (0 === t) {
                this.hostObserver || (this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId);
                (this.hostObserver = !0),
                  (this.gameOpts.humanPlayers[0].countryId = v.OBS_COUNTRY_ID),
                  delete a.observer;
              }
              ((a.type = y.SlotType.Ai),
                (a.difficulty = i),
                (r = this.gameOpts.aiPlayers)[t] ??
                  (r[t] = {
                    difficulty: i,
                    countryId: v.RANDOM_COUNTRY_ID,
                    colorId: v.RANDOM_COLOR_ID,
                    startPos: v.RANDOM_START_POS,
                    teamId: s.mustAlly ? 3 : v.NO_TEAM_ID,
                  }),
                (this.gameOpts.aiPlayers[t].difficulty = i));
              if (0 === t) {
                this.localPrefs.setItem(b.StorageKey.LastHostObserver, "ai");
                this.localPrefs.setItem(b.StorageKey.LastPlayerCountry, String(this.savedHostCountryId));
                return this.updateFormModel(), this.refreshSidebarButtons();
              }
            }
            (e === n.SlotOccupation.Closed &&
              ((this.slotsInfo[t].type = y.SlotType.Closed),
                delete this.slotsInfo[t].observer,
                (this.gameOpts.aiPlayers[t] = void 0)),
              this.updateFormModel());
          }
          saveBotSettings() {
            this.localPrefs.setItem(b.StorageKey.LastBots, new x.Serializer().serializeAiOpts(this.gameOpts.aiPlayers));
          }
          getCountryNameById(e) {
            let t;
            return (
              (t =
                e === v.RANDOM_COUNTRY_ID
                  ? v.RANDOM_COUNTRY_NAME
                  : e === v.OBS_COUNTRY_ID
                    ? v.OBS_COUNTRY_NAME
                    : this.getAvailablePlayerCountries()[e]),
              t
            );
          }
          getCountryIdByName(t) {
            let i;
            if (t === v.RANDOM_COUNTRY_NAME) i = v.RANDOM_COUNTRY_ID;
            else if (t === v.OBS_COUNTRY_NAME) i = v.OBS_COUNTRY_ID;
            else {
              let e = this.getAvailablePlayerCountries();
              i = e.indexOf(t);
            }
            return i;
          }
          getColorNameById(e) {
            let t;
            return ((t = e === v.RANDOM_COLOR_ID ? v.RANDOM_COLOR_NAME : this.getAvailablePlayerColors()[e]), t);
          }
          getColorIdByName(t) {
            let i;
            if (t === v.RANDOM_COLOR_NAME) i = v.RANDOM_COLOR_ID;
            else {
              let e = this.getAvailablePlayerColors();
              if (((i = e.indexOf(t)), -1 === i)) throw new Error(`Color ${t} not found in available player colors`);
            }
            return i;
          }
          updatePlayerInfo(t, i, r, s, a) {
            const n = this.slotsInfo[a];
            if (n.type === y.SlotType.Ai) {
              let e = this.gameOpts.aiPlayers[a];
              if (!e) throw new Error("No AI found on slot " + a);
              ((e.countryId = t), (e.colorId = i), (e.startPos = r), (e.teamId = s), this.saveBotSettings());
            } else {
              if (n.type !== y.SlotType.Player) throw new Error("Unexpected slot type " + n.type);
              {
                let e = this.gameOpts.humanPlayers.find((e) => e.name === n.name);
                if (!e) throw new Error("No player found on slot " + a);
                ((e.countryId = t),
                  (e.colorId = i),
                  (e.startPos = r),
                  (e.teamId = s),
                  t !== v.RANDOM_COUNTRY_ID
                    ? this.localPrefs.setItem(b.StorageKey.LastPlayerCountry, String(t))
                    : this.localPrefs.removeItem(b.StorageKey.LastPlayerCountry),
                  i !== v.RANDOM_COLOR_ID
                    ? this.localPrefs.setItem(b.StorageKey.LastPlayerColor, String(i))
                    : this.localPrefs.removeItem(b.StorageKey.LastPlayerColor),
                  r !== v.RANDOM_START_POS
                    ? this.localPrefs.setItem(b.StorageKey.LastPlayerStartPos, String(r))
                    : this.localPrefs.removeItem(b.StorageKey.LastPlayerStartPos),
                  s !== v.NO_TEAM_ID
                    ? this.localPrefs.setItem(b.StorageKey.LastPlayerTeam, String(s))
                    : this.localPrefs.removeItem(b.StorageKey.LastPlayerTeam));
              }
            }
            this.updateFormModel();
          }
          updateFormModel() {
            var e = this.gameOpts;
            ((this.formModel.gameSpeed = e.gameSpeed),
              (this.formModel.credits = e.credits),
              (this.formModel.unitCount = e.unitCount),
              (this.formModel.shortGame = e.shortGame),
              (this.formModel.superWeapons = e.superWeapons),
              (this.formModel.buildOffAlly = e.buildOffAlly),
              (this.formModel.mcvRepacks = e.mcvRepacks),
              (this.formModel.cratesAppear = e.cratesAppear),
              (this.formModel.destroyableBridges = e.destroyableBridges),
              (this.formModel.multiEngineer = e.multiEngineer),
              (this.formModel.noDogEngiKills = e.noDogEngiKills),
              (this.formModel.instantCapture = e.instantCapture),
              (this.formModel.delayedOils = e.delayedOils));
            let i = e.maxSlots;
            (this.slotsInfo.forEach((e, t) => {
              i
                ? (i--,
                  (this.formModel.playerSlots[t] = {
                    country: v.RANDOM_COUNTRY_NAME,
                    color: v.RANDOM_COLOR_NAME,
                    startPos: v.RANDOM_START_POS,
                    team: v.NO_TEAM_ID,
                  }))
                : (this.formModel.playerSlots[t] = void 0);
            }),
              this.slotsInfo.forEach((t, i) => {
                if (this.formModel.playerSlots[i]) {
                  let e = this.formModel.playerSlots[i];
                  (t.observer
                    ? (e.occupation = n.SlotOccupation.Observer)
                    : t.type === y.SlotType.Closed
                      ? (e.occupation = n.SlotOccupation.Closed)
                      : t.type === y.SlotType.Open || t.type === y.SlotType.OpenObserver
                        ? (e.occupation = n.SlotOccupation.Open)
                        : (e.occupation = n.SlotOccupation.Occupied),
                    t.type === y.SlotType.Ai
                      ? ((e.aiDifficulty = t.difficulty), (e.type = n.SlotType.Ai))
                      : t.type === y.SlotType.Player && ((e.name = t.name), (e.type = n.SlotType.Player)),
                    (e.status = n.PlayerStatus.NotReady));
                }
              }));
            let r = this.gameOpts ? this.gameOpts.humanPlayers : [],
              s = this.gameOpts ? this.gameOpts.aiPlayers : [],
              a = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
            (this.formModel.playerSlots.forEach((t, e) => {
              var i;
              t &&
                r.length &&
                (t.occupation === n.SlotOccupation.Occupied
                  ? (i = r.find((e) => e.name === t.name))
                    ? ((t.country = this.getCountryNameById(i.countryId)),
                      (t.color = this.getColorNameById(i.colorId)),
                      (t.startPos = i.startPos),
                      (t.team = i.teamId))
                    : (i = s[e]) &&
                      ((t.country = this.getCountryNameById(i.countryId)),
                      (t.color = this.getColorNameById(i.colorId)),
                      (t.startPos = i.startPos),
                      (t.team = i.teamId))
                  : ((t.country = v.RANDOM_COUNTRY_NAME), (t.team = a.mustAlly ? 3 : v.NO_TEAM_ID)));
            }),
              (this.formModel.availablePlayerColors = this.getSelectablePlayerColors(this.formModel.playerSlots)),
              (this.formModel.availableStartPositions = this.getSelectableStartPositions(
                this.formModel.playerSlots,
                e.maxSlots,
              )),
              (this.formModel.teamsAllowed = this.gameModes.getById(e.gameMode).mpDialogSettings.alliesAllowed),
              (this.formModel.teamsRequired = this.gameModes.getById(e.gameMode).mpDialogSettings.mustAlly),
              this.lobbyForm && r.length && this.lobbyForm.refresh());
          }
          updateMapPreview() {
            (this.mapTask?.cancel(),
              (this.mapTask = new i.Task(async (t) => {
                if (this.controller) {
                  this.controller.setSidebarPreview();
                  let e;
                  try {
                    e = new m.MapFile(await this.mapFileLoader.load(this.gameOpts.mapName, t));
                  } catch (e) {
                    if (e instanceof l.DownloadError)
                      return void this.handleError(e, this.strings.get("TXT_DOWNLOAD_FAILED"));
                    throw e;
                  }
                  var i = new u.MapPreviewRenderer(this.strings).render(
                    e,
                    n.LobbyType.Singleplayer,
                    this.controller.getSidebarPreviewSize(),
                  );
                  this.controller.setSidebarPreview(i);
                }
              })),
              this.mapTask.start().catch((e) => {
                e instanceof c.OperationCanceledError ||
                  (console.error("Failed to render map preview"), console.error(e));
              }),
              this.disposables.add(
                () => this.mapTask?.cancel(),
                () => (this.mapTask = void 0),
              ));
          }
          initLobbyForm() {
            var [e] = this.jsxRenderer.render(
              a.jsx(o.HtmlView, {
                innerRef: (e) => (this.lobbyForm = e),
                component: r.LobbyForm,
                props: this.formModel,
              }),
            );
            this.controller.setMainComponent(e);
          }
          refreshSidebarButtons() {
            let e = this.strings;
            var t = [
              {
                label: e.get("GUI:StartGame"),
                tooltip: e.get("STT:SkirmishButtonStartGame"),
                disabled: !1,
                onClick: () => {
                  this.gameOpts.aiPlayers.filter(g.isNotNullOrUndefined).length < 1
                    ? this.messageBoxApi.show(
                        this.strings.get("TXT_NEED_AT_LEAST_TWO_PLAYERS"),
                        this.strings.get("GUI:Ok"),
                      )
                    : this.meetsMinimumTeams()
                      ? this.rootController.createGame(
                          "0",
                          Date.now(),
                          void 0,
                          this.playerName,
                          this.gameOpts,
                          !0,
                          !1,
                          !1,
                          !1,
                          new f.MainMenuRoute(s.ScreenType.Skirmish),
                        )
                      : this.messageBoxApi.show(this.strings.get("TXT_CANNOT_ALLY"), this.strings.get("GUI:Ok"));
                },
              },
              {
                label: e.get("GUI:ChooseMap"),
                tooltip: e.get("STT:SkirmishButtonChooseMap"),
                onClick: () => {
                  this.controller?.pushScreen(s.ScreenType.MapSelection, {
                    lobbyType: n.LobbyType.Singleplayer,
                    gameOpts: this.gameOpts,
                    usedSlots: () =>
                      1 +
                      d.findIndexReverse(
                        this.slotsInfo,
                        (e) => e.type === y.SlotType.Ai || e.type === y.SlotType.Player,
                      ),
                  });
                },
              },
              {
                label: e.get("GUI:Back"),
                tooltip: e.get("STT:SkirmishButtonBack"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.goToScreen(s.ScreenType.Home);
                },
              },
            ];
            (this.controller.setSidebarButtons(t, !0), this.refreshSidebarMpText());
          }
          meetsMinimumTeams() {
            let e = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
                .filter(g.isNotNullOrUndefined)
                .filter((e) => e.countryId !== v.OBS_COUNTRY_ID),
              t = e[0]?.teamId;
            return e.length < 2 || t === v.NO_TEAM_ID || e.some((e) => e.teamId !== t);
          }
          refreshSidebarMpText() {
            this.controller?.setSidebarMpContent({
              text: this.gameOpts
                ? this.strings.get(this.gameModes.getById(this.gameOpts.gameMode).label) +
                  "\n\n" +
                  this.gameOpts.mapTitle
                : "",
            });
          }
          async onLeave() {
            (this.disposables.dispose(),
              (this.gameOpts = void 0),
              (this.slotsInfo = void 0),
              (this.currentMapFile = void 0),
              this.controller.toggleSidebarPreview(!1),
              await this.unrender());
          }
          async unrender() {
            (await this.controller.hideSidebarButtons(), this.lobbyForm && (this.lobbyForm = void 0));
          }
        }),
          e("SkirmishScreen", O));
      },
    };
  },
);
