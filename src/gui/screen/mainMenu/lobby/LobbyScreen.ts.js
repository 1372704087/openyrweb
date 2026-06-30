// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/LobbyScreen ===
// deps: ["@puzzl/core/lib/async/Task","network/WolConnection","network/WolError","network/gameopt/SlotInfo","game/gameopts/GameOpts","game/gameopts/constants","gui/screen/mainMenu/lobby/component/LobbyForm","gui/screen/mainMenu/lobby/component/viewmodel/lobby","gui/screen/mainMenu/lobby/component/PasswordBox","gui/screen/mainMenu/lobby/component/CreateGameBox","gui/screen/mainMenu/ScreenType","util/disposable/CompositeDisposable","gui/jsx/jsx","gui/jsx/HtmlView","engine/ResourceLoader","@puzzl/core/lib/async/cancellation","gui/screen/mainMenu/lobby/MapPreviewRenderer","util/array","engine/sound/SoundKey","engine/sound/ChannelType","LocalPrefs","gui/screen/mainMenu/lobby/PreferredHostOpts","util/typeGuard","game/gameopts/GameOptSanitizer","gui/screen/mainMenu/MainMenuScreen","data/MapFile","engine/MapDigest","network/gservConfig","network/WolConfig","gui/screen/mainMenu/MainMenuRoute","@puzzl/core/lib/async/sleep","network/chat/ChatMessage","gui/chat/ChatHistory","util/time","network/partyCodes"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/LobbyScreen",
  [
    "@puzzl/core/lib/async/Task",
    "network/WolConnection",
    "network/WolError",
    "network/gameopt/SlotInfo",
    "game/gameopts/GameOpts",
    "game/gameopts/constants",
    "gui/screen/mainMenu/lobby/component/LobbyForm",
    "gui/screen/mainMenu/lobby/component/viewmodel/lobby",
    "gui/screen/mainMenu/lobby/component/PasswordBox",
    "gui/screen/mainMenu/lobby/component/CreateGameBox",
    "gui/screen/mainMenu/ScreenType",
    "util/disposable/CompositeDisposable",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "engine/ResourceLoader",
    "@puzzl/core/lib/async/cancellation",
    "gui/screen/mainMenu/lobby/MapPreviewRenderer",
    "util/array",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "LocalPrefs",
    "gui/screen/mainMenu/lobby/PreferredHostOpts",
    "util/typeGuard",
    "game/gameopts/GameOptSanitizer",
    "gui/screen/mainMenu/MainMenuScreen",
    "data/MapFile",
    "engine/MapDigest",
    "network/gservConfig",
    "network/WolConfig",
    "gui/screen/mainMenu/MainMenuRoute",
    "@puzzl/core/lib/async/sleep",
    "network/chat/ChatMessage",
    "gui/chat/ChatHistory",
    "util/time",
    "network/partyCodes",
  ],
  function (e, t) {
    "use strict";
    var w, E, u, C, i, d, r, c, s, a, x, O, n, o, h, A, l, g, M, R, p, m, P, f, y, T, v, b, S, I, k, B, N, j, L, D;
    t && t.id;
    return {
      setters: [
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          P = e;
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
        function (e) {
          S = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
      ],
      execute: function () {
        (0,
          (D = class extends y.MainMenuScreen {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S) {
              (super(),
                (this.botsEnabled = e),
                (this.engineModHash = t),
                (this.activeModMeta = i),
                (this.rootController = r),
                (this.errorHandler = s),
                (this.messageBoxApi = a),
                (this.strings = n),
                (this.uiScene = o),
                (this.wolCon = l),
                (this.wolService = c),
                (this.wladderService = h),
                (this.mapTransferService = u),
                (this.gservCon = d),
                (this.rules = g),
                (this.gameOptParser = p),
                (this.gameOptSerializer = m),
                (this.jsxRenderer = f),
                (this.mapFileLoader = y),
                (this.mapList = T),
                (this.gameModes = v),
                (this.sound = b),
                (this.localPrefs = S),
                (this.messages = []),
                (this.playerReadyStatus = new Map()),
                (this.playerHasMapStatus = new Map()),
                (this.acceptButtonFlashing = !1),
                (this.playerProfiles = new Map()),
                (this.disposables = new O.CompositeDisposable()),
                (this.updatePings = () => {
                  if (this.wolCon.isOpen()) {
                    if (this.gameChannelName && this.wolCon.isInChannel(this.gameChannelName)) {
                      this.pingsUpdateTask?.cancel();
                      let e = (this.pingsUpdateTask = new w.Task(async (e) => {
                        var t = await this.wolCon.listUsers(this.gameChannelName);
                        if (!e.isCancelled()) {
                          for (var i of t) this.updatePlayerPing(i.name, i.ping);
                          this.sendPingData();
                        }
                      }));
                      e.start().catch((e) => {
                        e instanceof A.OperationCanceledError || console.error(e);
                      });
                    }
                  } else this.onWolClose();
                }),
                (this.updateRanks = () => {
                  if (this.wladderService.getUrl() && this.slotsInfo) {
                    this.ranksUpdateTask?.cancel();
                    let e = (this.ranksUpdateTask = new w.Task(async (e) => {
                      await k.sleep(5e3, e);
                      var t = this.slotsInfo
                          .map((e) => (e.type === C.SlotType.Player ? e.name : void 0))
                          .filter(P.isNotNullOrUndefined),
                        t = await this.wladderService.listSearch(t, e);
                      if (!e.isCancelled()) {
                        for (var i of t) this.playerProfiles.set(i.name, i);
                        this.updateFormModel();
                      }
                    }));
                    e.start().catch((e) => {
                      e instanceof A.OperationCanceledError || console.error(e);
                    });
                  }
                }),
                (this.handlePartyUpdate = (e) => {
                  var t = e.split(" ");
                  t[0] !== L.RPL_PARTY_INVITE || ((t = t[1]) && this.wolCon.partyInviteUnavailable(t));
                }),
                (this.onChannelLeave = (e) => {
                  e.channel === this.gameChannelName &&
                    (this.hostMode
                      ? e.user.name !== this.wolCon.getCurrentUser() && this.handlePlayerJoinLeave(e)
                      : (e.user.name !== this.hostPlayerName && e.user.name !== this.wolCon.getCurrentUser()) ||
                        this.controller?.goToScreen(x.ScreenType.CustomGame, {}));
                }),
                (this.onChannelJoin = (e) => {
                  this.wolCon.isOpen() &&
                    this.gameChannelName &&
                    e.user.name !== this.wolCon.getCurrentUser() &&
                    (this.sound.play(
                      "join" === e.type ? M.SoundKey.PlayerJoined : M.SoundKey.PlayerLeft,
                      R.ChannelType.Ui,
                    ),
                    "join" === e.type && this.updatePlayerPing(e.user.name, e.user.ping),
                    this.hostMode ? this.handlePlayerJoinLeave(e) : this.wolCon.sendPlayerReady(!1),
                    this.playerProfiles.has(e.user.name) || this.updateRanks());
                }),
                (this.onChannelMessage = (e) => {
                  (this.lobbyForm &&
                    ((e.to.type !== B.ChatRecipientType.Page && e.to.type !== B.ChatRecipientType.Whisper) ||
                      this.sound.play(M.SoundKey.IncomingMessage, R.ChannelType.Ui),
                    this.messages.push(e),
                    this.lobbyForm.refresh()),
                    e.to.type === B.ChatRecipientType.Whisper &&
                      e.to.name !== this.wolCon.getServerName() &&
                      e.from !== this.wolCon.getCurrentUser() &&
                      (this.chatHistory.lastWhisperFrom.value = e.from));
                }),
                (this.handleGameStart = (e) => {
                  var t,
                    i,
                    r = this.wolCon.getCurrentUser(),
                    s = new I.MainMenuRoute(x.ScreenType.Login, {
                      afterLogin: (e) => new I.MainMenuRoute(x.ScreenType.CustomGame, { messages: e }),
                    });
                  this.hostMode
                    ? ((t = this.frozenGameOpts ?? this.gameOpts),
                      (i = [...this.playerHasMapStatus.values()].includes(E.WolHasMapStatus.MapTransfer)),
                      this.rootController.createGame(
                        e.gameId,
                        e.timestamp,
                        e.gservUrl,
                        r,
                        t,
                        !1,
                        this.isTournament,
                        i,
                        this.hostPrivateGame,
                        s,
                      ))
                    : ((i = this.playerHasMapStatus.get(r) === E.WolHasMapStatus.MapTransfer),
                      this.rootController.joinGame(e.gameId, e.timestamp, e.gservUrl, r, this.isTournament, i, s));
                }),
                (this.handleGameServer = (e) => {
                  this.currentGameServer?.id !== e.id &&
                    ((this.currentGameServer = e),
                    (this.formModel.selectedGameServer = e.id),
                    (this.playerPings.length = 0),
                    this.lobbyForm?.refresh(),
                    this.hostMode && this.updatePings(),
                    this.updateGservPing());
                }),
                (this.handleGameOpt = (e) => {
                  let t = e.opt,
                    i = t[0];
                  if (this.hostMode) {
                    if (e.user !== this.hostPlayerName)
                      if ("A" === i) this.handleGameOptReady(e.user, t[1]);
                      else if ("R" === i) this.handlePlayerOptsChange(e.user, t);
                      else {
                        if ("K" !== i) throw new Error("Unknown GAMEOPT string " + t);
                        this.handleGameOptHasMap(e.user, t[1]);
                      }
                  } else if ("L" === i)
                    (this.handleGameOptSlots(t),
                      this.slotsInfo.some((e) => e.type === C.SlotType.Player && !this.playerProfiles.has(e.name)) &&
                        this.updateRanks());
                  else if ("P" === i) this.handleGameOptPing(t.slice(1));
                  else if ("O" === i) this.handleGameOptObserver(t[1]);
                  else if ("A" === i) this.handleGameOptReady(e.user, t[1]);
                  else if ("K" === i) this.handleGameOptHasMap(e.user, t[1]);
                  else {
                    if ("R" === i) return;
                    if ("G" === i)
                      return void (
                        this.playerReadyStatus.get(this.wolCon.getCurrentUser()) ||
                        (this.addSystemMessage(this.strings.get("GUI:HostGameStartJoiner")),
                        (this.acceptButtonFlashing = !0),
                        this.refreshSidebarButtons())
                      );
                    if (!i.match(/^-|\d+/)) throw new Error("Unknown GAMEOPT string " + t);
                    this.handleGameOptOptions(t);
                  }
                  this.updateFormModel();
                }),
                (this.onWolClose = () => {
                  (this.hostOptsIntervalId && clearInterval(this.hostOptsIntervalId),
                    this.gservPingIntervalId && clearInterval(this.gservPingIntervalId));
                }),
                (this.onWolConLost = (e) => {
                  this.errorHandler.handle(e, this.strings.get("TXT_YOURE_DISCON"), () => {
                    this.controller?.goToScreen(x.ScreenType.Home);
                  });
                }));
            }
            async onEnter(t) {
              if (this.wolCon.getCurrentUser()) {
                let e = new A.CancellationTokenSource();
                this.disposables.add(() => e.cancel());
                var i,
                  r,
                  s = e.token;
                ((this.gameChannelName = void 0),
                  (this.lobbyForm = void 0),
                  (this.chatHistory = new N.ChatHistory()),
                  (this.playerPings = []),
                  this.initFormModel(),
                  this.wolCon.onGameOpt.subscribe(this.handleGameOpt),
                  this.wolCon.onGameStart.subscribe(this.handleGameStart),
                  this.wolCon.onGameServer.subscribe(this.handleGameServer),
                  this.wolCon.onLeaveChannel.subscribe(this.onChannelLeave),
                  this.wolCon.onJoinChannel.subscribe(this.onChannelJoin),
                  this.wolCon.onChatMessage.subscribe(this.onChannelMessage),
                  this.wolCon.onClose.subscribe(this.onWolClose),
                  this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate),
                  this.wolService.onWolConnectionLost.subscribe(this.onWolConLost),
                  (this.hostMode = t.create),
                  this.hostMode
                    ? ((this.title = this.strings.get("GUI:HostScreen")), this.createGame(s))
                    : ((this.title = this.strings.get("GUI:JoinScreen")),
                      ({ game: i, observe: r } = t),
                      this.joinGame(i, r, void 0, s)));
              } else
                this.messageBoxApi.show(this.strings.get("TXT_YOURE_DISCON"), this.strings.get("GUI:Ok"), () => {
                  this.controller?.goToScreen(x.ScreenType.Home);
                });
            }
            async joinGame(t, i, e, r) {
              if (e || !t.passLocked) {
                var s = t.name;
                try {
                  var a = this.waitForHostPlayer(s, r).catch((e) => {
                    if (!(e instanceof A.OperationCanceledError)) throw e;
                  });
                  if ((await this.wolCon.joinGame(s, e, i), r.isCancelled())) return;
                  this.gameChannelName = s;
                  var n,
                    o,
                    l,
                    c = await a;
                  if (r?.isCancelled()) return;
                  ((this.hostPlayerName = c.name),
                    (this.hostIsFreshAccount = c.fresh),
                    (this.isTournament = t.tournament),
                    (this.formModel.channels = [this.gameChannelName]),
                    i
                      ? this.sendPlayerInfo(d.OBS_COUNTRY_ID, d.RANDOM_COLOR_ID, d.RANDOM_START_POS, d.NO_TEAM_ID)
                      : ((n = this.localPrefs.getItem(p.StorageKey.LastPlayerCountry)),
                        (o = this.localPrefs.getItem(p.StorageKey.LastPlayerColor)),
                        (l =
                          void 0 !== n && Number(n) < this.getAvailablePlayerCountries().length
                            ? Number(n)
                            : d.RANDOM_COUNTRY_ID),
                        (h =
                          void 0 !== o &&
                          Number(o) < this.getAvailablePlayerColors().length &&
                          this.getSelectablePlayerColors().includes(this.getColorNameById(Number(o)))
                            ? Number(o)
                            : d.RANDOM_COLOR_ID),
                        (l === d.RANDOM_COUNTRY_ID && h === d.RANDOM_COLOR_ID) ||
                          this.sendPlayerInfo(l, h, d.RANDOM_START_POS, d.NO_TEAM_ID)),
                    (this.observerSlotIndex = 8));
                } catch (t) {
                  if (t instanceof u.WolError) {
                    let e = new Map()
                      .set(u.WolError.Code.BadChannelPass, "TXT_BADPASS")
                      .set(u.WolError.Code.GameHasClosed, "TXT_GAME_CLOSED")
                      .set(u.WolError.Code.ChannelFull, "TXT_CHANNEL_FULL")
                      .set(u.WolError.Code.BannedFromChannel, "TXT_JOINBAN");
                    var h = e.get(t.code);
                    if (h)
                      return void this.messageBoxApi.show(this.strings.get(h), this.strings.get("GUI:Ok"), () => {
                        this.controller?.goToScreen(x.ScreenType.CustomGame, {});
                      });
                  } else if (t instanceof A.OperationCanceledError) return;
                  return void this.handleError(t, this.strings.get("WOL:MatchBadParameters"));
                }
                (this.controller.toggleSidebarPreview(!0), this.initView());
              } else
                this.showPasswordBox(
                  (e) => {
                    this.joinGame(t, i, e, r);
                  },
                  () => {
                    this.controller?.goToScreen(x.ScreenType.CustomGame, {});
                  },
                );
            }
            waitForHostPlayer(a, e) {
              return new Promise((i, r) => {
                let s = (e) => {
                  var t;
                  e.channelName === a &&
                    (this.wolCon.onChannelUsers.unsubscribe(s),
                    (t = e.users.find((e) => e.operator)) ? i(t) : r(new Error("Host player not found")));
                };
                (this.wolCon.onChannelUsers.subscribe(s),
                  e.register(() => {
                    (this.wolCon.onChannelUsers.unsubscribe(s), r(new A.OperationCanceledError(e)));
                  }));
              });
            }
            async createGame(r, e) {
              if (e) {
                try {
                  var { roomDesc: t, tournament: i, observe: s, pass: a } = e,
                    n = this.wolCon.makeGameChannelName(),
                    o = this.waitForHostPlayer(n, r).catch((e) => {
                      if (!(e instanceof A.OperationCanceledError)) throw e;
                    });
                  if (
                    (await this.wolCon.createGame(n, 1, 9, this.wolService.getConfig().getClientChannelType(), i, a),
                    r?.isCancelled())
                  )
                    return;
                  this.gameChannelName = n;
                  var l = await o;
                  if (r?.isCancelled()) return;
                  if (
                    ((this.hostPlayerName = this.wolCon.getCurrentUser()),
                    (this.hostIsFreshAccount = l.fresh),
                    (this.hostRoomDesc = t),
                    (this.isTournament = i),
                    (this.hostPrivateGame = !!a),
                    (this.observerSlotIndex = s ? 0 : 8),
                    (this.formModel.lobbyType = c.LobbyType.MultiplayerHost),
                    (this.formModel.activeSlotIndex = s ? -1 : 0),
                    (this.formModel.channels = [this.gameChannelName]),
                    await this.initHostOptions(s, r),
                    r?.isCancelled())
                  )
                    return;
                  (this.updateMapPreview(this.currentMapFile),
                    this.updateFormModel(),
                    this.updatePings(),
                    this.updateRanks(),
                    this.sendGameOpts(),
                    this.sendModeMaxSlots(),
                    (this.hostOptsIntervalId = setInterval(() => {
                      this.wolCon.isOpen() && this.gameChannelName && (this.sendGameOpts(), this.updatePings());
                    }, 5e3)));
                } catch (e) {
                  return void this.handleError(
                    e,
                    e instanceof h.DownloadError
                      ? this.strings.get("TXT_DOWNLOAD_FAILED")
                      : this.strings.get("WOL:MatchBadParameters"),
                  );
                }
                (this.controller.toggleSidebarPreview(!0), this.initView());
              } else
                this.showCreateGameBox(
                  (e, t, i) => {
                    this.createGame(r, { roomDesc: e, observe: i, pass: t, tournament: !1 });
                  },
                  () => {
                    this.controller?.goToScreen(x.ScreenType.CustomGame, {});
                  },
                );
            }
            onViewportChange() {
              (this.createGameBox && this.createGameBox.applyOptions((e) => (e.viewport = this.uiScene.viewport)),
                this.passBox && this.passBox.applyOptions((e) => (e.viewport = this.uiScene.viewport)));
            }
            onUnstack(n) {
              if (this.wolCon.isOpen() && this.gameChannelName) {
                if (n) {
                  let t = n.gameMode.id !== this.gameOpts.gameMode;
                  var o = n.mapName !== this.gameOpts.mapName;
                  this.gameOpts.gameMode = n.gameMode.id;
                  let i = this.mapList.getByName(n.mapName),
                    r = n.changedMapFile ?? this.currentMapFile;
                  this.currentMapFile = r;
                  var l = g.findIndexReverse(
                      this.slotsInfo,
                      (e, t) =>
                        e.type === C.SlotType.Ai ||
                        (e.type === C.SlotType.Player && (this.observerSlotIndex !== t || 0 === t)) ||
                        e.type === C.SlotType.Open,
                    ),
                    c = Math.min(9, i.maxSlots + (0 === this.observerSlotIndex ? 1 : 0)),
                    h = Math.max(0, l + 1 - c);
                  for (let a = 0; a < h; a++) {
                    let e = this.slotsInfo[l - a];
                    (e.type === C.SlotType.Player
                      ? this.kickPlayer(e.name)
                      : e.type === C.SlotType.Ai && (this.gameOpts.aiPlayers[l - a] = void 0),
                      (e.type = C.SlotType.Closed));
                  }
                  for (let e = l + 1; e < c; e++)
                    this.slotsInfo[e].type = this.preferredHostOpts.slotsClosed.has(e)
                      ? C.SlotType.Closed
                      : this.observerSlotIndex === e
                        ? C.SlotType.OpenObserver
                        : C.SlotType.Open;
                  let s = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
                  if (
                    ([...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers].forEach((e) => {
                      e &&
                        (e.startPos > i.maxSlots - 1 && (e.startPos = d.RANDOM_START_POS),
                        t && (e.teamId = s.alliesAllowed && s.mustAlly ? 0 : d.NO_TEAM_ID));
                    }),
                    o)
                  ) {
                    for (var u of this.playerReadyStatus.keys()) this.playerReadyStatus.set(u, !1);
                    this.playerHasMapStatus.clear();
                  }
                  (this.sendGameSlotInfo(),
                    this.sendModeMaxSlots(),
                    this.applyGameOption((e) => {
                      ((e.mapName = i.fileName),
                        (e.mapDigest = v.MapDigest.compute(r)),
                        (e.mapSizeBytes = r.getSize()),
                        (e.mapTitle = i.getFullMapTitle(this.strings)),
                        (e.maxSlots = i.maxSlots),
                        (e.mapOfficial = i.official));
                    }),
                    this.localPrefs.setItem(p.StorageKey.LastMap, i.fileName),
                    this.localPrefs.setItem(p.StorageKey.LastMode, String(n.gameMode.id)));
                }
                (this.updateMapPreview(this.currentMapFile), this.initView());
              } else this.onWolClose();
            }
            async onStack() {
              await this.unrender();
            }
            initView() {
              (this.initLobbyForm(),
                this.refreshSidebarButtons(),
                this.refreshSidebarMpText(),
                this.controller.showSidebarButtons(),
                (this.gservPingIntervalId = setInterval(() => {
                  this.updateGservPing();
                }, 3e4)));
            }
            async initHostOptions(i, e) {
              var r = this.localPrefs.getItem(p.StorageKey.PreferredGameOpts),
                s = this.localPrefs.getItem(p.StorageKey.LastPlayerCountry),
                a = this.localPrefs.getItem(p.StorageKey.LastPlayerColor),
                t = this.localPrefs.getItem(p.StorageKey.LastMap),
                n = this.localPrefs.getItem(p.StorageKey.LastMode);
              let o = t ? this.mapList.getByName(t) : void 0,
                l = o && n && this.gameModes.hasId(Number(n)) ? Number(n) : 1,
                c = this.gameModes.getById(l),
                h;
              h = o?.gameModes.find((e) => e.mapFilter === c.mapFilter)
                ? o
                : ((l = 1),
                  (c = this.gameModes.getById(l)),
                  this.mapList.getAll().find((e) => e.gameModes.find((e) => c.mapFilter === e.mapFilter)));
              let u = await this.mapFileLoader.load(h.fileName);
              if (!e?.isCancelled()) {
                this.currentMapFile = u;
                let e = (this.preferredHostOpts = new m.PreferredHostOpts());
                r ? e.unserialize(r) : e.applyMpDialogSettings(this.rules.mpDialogSettings);
                r = this.gameModes.getById(l).mpDialogSettings;
                ((this.gameOpts = {
                  gameMode: l,
                  shortGame: e.shortGame,
                  mcvRepacks: e.mcvRepacks,
                  cratesAppear: e.cratesAppear,
                  superWeapons: e.superWeapons,
                  gameSpeed: e.gameSpeed,
                  credits: e.credits,
                  unitCount: e.unitCount,
                  buildOffAlly: e.buildOffAlly,
                  hostTeams: e.hostTeams,
                  destroyableBridges: e.destroyableBridges,
                  multiEngineer: e.multiEngineer,
                  noDogEngiKills: e.noDogEngiKills,
                  instantCapture: e.instantCapture,
                  delayedOils: e.delayedOils,
                  humanPlayers: [
                    {
                      name: this.hostPlayerName,
                      countryId: i
                        ? d.OBS_COUNTRY_ID
                        : void 0 !== s && Number(s) < this.getAvailablePlayerCountries().length
                          ? Number(s)
                          : d.RANDOM_COUNTRY_ID,
                      colorId:
                        !i && void 0 !== a && Number(a) < this.getAvailablePlayerColors().length
                          ? Number(a)
                          : d.RANDOM_COLOR_ID,
                      startPos: d.RANDOM_START_POS,
                      teamId: r.mustAlly ? 0 : d.NO_TEAM_ID,
                    },
                  ],
                  aiPlayers: new Array(8).fill(void 0),
                  mapName: h.fileName,
                  mapDigest: v.MapDigest.compute(u),
                  mapSizeBytes: u.getSize(),
                  mapTitle: h.getFullMapTitle(this.strings),
                  maxSlots: h.maxSlots,
                  mapOfficial: h.official,
                }),
                  (this.slotsInfo = [{ type: C.SlotType.Player, name: this.hostPlayerName }]));
                for (let t = 1; t < 9; ++t)
                  this.slotsInfo.push({
                    type: e.slotsClosed.has(t)
                      ? C.SlotType.Closed
                      : this.observerSlotIndex === t
                        ? C.SlotType.OpenObserver
                        : t < h.maxSlots + (i ? 1 : 0)
                          ? C.SlotType.Open
                          : C.SlotType.Closed,
                  });
                this.playerProfiles.clear();
              }
            }
            updateGservPing() {
              if (this.wolCon.isOpen()) {
                if (this.gameChannelName && this.wolCon.isInChannel(this.gameChannelName)) {
                  this.gservPingUpdateTask?.cancel();
                  let e = (this.gservPingUpdateTask = new w.Task(async (e) => {
                    var t;
                    this.currentGameServer &&
                      ((t = this.currentGameServer.url),
                      void 0 !== (t = await this.pingGserv(t, e)) &&
                        (this.wolCon.sendGservPing(this.currentGameServer.id, t), this.hostMode && this.updatePings()));
                  }));
                  e.start().catch((e) => {
                    e instanceof A.OperationCanceledError || console.error(e);
                  });
                }
              } else this.onWolClose();
            }
            async pingGserv(e, t) {
              try {
                (await this.gservCon.connect(e, { cancelToken: t, timeoutSeconds: 5 }), t?.throwIfCancelled());
                var i = await this.gservCon.ping(5);
                return (t?.throwIfCancelled(), i);
              } catch (e) {
                return void (e instanceof A.OperationCanceledError || console.error(e));
              } finally {
                this.gservCon.close();
              }
            }
            handleError(e, t) {
              (this.errorHandler.handle(e, t, () => {
                this.controller?.goToScreen(x.ScreenType.CustomGame, {});
              }),
                this.hostOptsIntervalId && clearInterval(this.hostOptsIntervalId),
                this.gservPingIntervalId && clearInterval(this.gservPingIntervalId));
            }
            showPasswordBox(t, e) {
              let [i] = this.jsxRenderer.render(
                n.jsx(o.HtmlView, {
                  innerRef: (e) => (this.passBox = e),
                  component: s.PasswordBox,
                  props: {
                    strings: this.strings,
                    onSubmit: (e) => {
                      (t(e), i.destroy());
                    },
                    onDismiss: () => {
                      (e(), i.destroy());
                    },
                    viewport: this.uiScene.viewport,
                  },
                }),
              );
              (this.uiScene.add(i),
                this.disposables.add(
                  i,
                  () => this.uiScene.remove(i),
                  () => (this.passBox = void 0),
                ));
            }
            showCreateGameBox(r, e) {
              let [s] = this.jsxRenderer.render(
                n.jsx(o.HtmlView, {
                  component: a.CreateGameBox,
                  innerRef: (e) => (this.createGameBox = e),
                  props: {
                    strings: this.strings,
                    onSubmit: (e, t, i) => {
                      (s.destroy(), r(e, t, i));
                    },
                    onDismiss: () => {
                      (s.destroy(), e());
                    },
                    viewport: this.uiScene.viewport,
                  },
                }),
              );
              (this.uiScene.add(s),
                this.disposables.add(
                  s,
                  () => this.uiScene.remove(s),
                  () => (this.createGameBox = void 0),
                ));
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
            getAvailableStartPositions() {
              return new Array(this.gameOpts?.maxSlots ?? 8).fill(0).map((e, t) => t);
            }
            getSelectablePlayerColors() {
              let t = [];
              this.formModel &&
                this.formModel.playerSlots.forEach((e) => {
                  e && t.push(e.color);
                });
              let e = this.getAvailablePlayerColors();
              return [d.RANDOM_COLOR_NAME].concat(e.filter((e) => e && -1 === t.indexOf(e)));
            }
            getSelectableStartPositions() {
              let t = [];
              this.formModel &&
                this.formModel.playerSlots.forEach((e) => {
                  e && t.push(e.startPos);
                });
              let e = this.getAvailableStartPositions();
              return [d.RANDOM_START_POS].concat(e.filter((e) => !t.includes(e)));
            }
            initFormModel() {
              var e = this.rules.mpDialogSettings;
              ((this.formModel = {
                strings: this.strings,
                countryUiNames: new Map(
                  [
                    [d.RANDOM_COUNTRY_NAME, d.RANDOM_COUNTRY_UI_NAME],
                    [d.OBS_COUNTRY_NAME, d.OBS_COUNTRY_UI_NAME],
                  ].concat(this.getAvailablePlayerCountryRules().map((e) => [e.name, e.uiName])),
                ),
                countryUiTooltips: new Map(
                  [
                    [d.RANDOM_COUNTRY_NAME, d.RANDOM_COUNTRY_UI_TOOLTIP],
                    [d.OBS_COUNTRY_NAME, d.OBS_COUNTRY_UI_TOOLTIP],
                  ].concat(
                    this.getAvailablePlayerCountryRules()
                      .filter((e) => e.uiTooltip)
                      .map((e) => [e.name, e.uiTooltip]),
                  ),
                ),
                availablePlayerCountries: [d.RANDOM_COUNTRY_NAME].concat(this.getAvailablePlayerCountries()),
                availablePlayerColors: this.getSelectablePlayerColors(),
                availableAiNames: this.botsEnabled
                  ? new Map([...d.aiUiNames.entries()].filter(([e]) => e !== i.AiDifficulty.Easy))
                  : new Map(),
                availableStartPositions: this.getSelectableStartPositions(),
                maxTeams: 4,
                lobbyType: c.LobbyType.MultiplayerGuest,
                messages: this.messages,
                chatHistory: this.chatHistory,
                channels: [],
                localUsername: this.wolCon.getCurrentUser(),
                mpDialogSettings: e,
                onSendMessage: (e) => {
                  e.value.length
                    ? this.wolCon.isOpen() &&
                      this.gameChannelName &&
                      (this.wolCon.sendChatMessage(e.value, e.recipient),
                      e.recipient.type === B.ChatRecipientType.Whisper &&
                        (this.chatHistory.lastWhisperTo.value = e.recipient.name))
                    : this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
                },
                onCountrySelect: (e, t) => {
                  this.wolCon.isOpen() &&
                    this.gameChannelName &&
                    (this.sendPlayerInfo(
                      this.getCountryIdByName(e),
                      this.getColorIdByName(this.formModel.playerSlots[t].color),
                      this.formModel.playerSlots[t].startPos,
                      this.formModel.playerSlots[t].team,
                      t,
                    ),
                    this.updateFormModel());
                },
                onColorSelect: (e, t) => {
                  this.wolCon.isOpen() &&
                    this.gameChannelName &&
                    (this.sendPlayerInfo(
                      this.getCountryIdByName(this.formModel.playerSlots[t].country),
                      this.getColorIdByName(e),
                      this.formModel.playerSlots[t].startPos,
                      this.formModel.playerSlots[t].team,
                      t,
                    ),
                    this.updateFormModel());
                },
                onStartPosSelect: (e, t) => {
                  this.wolCon.isOpen() &&
                    this.gameChannelName &&
                    (this.sendPlayerInfo(
                      this.getCountryIdByName(this.formModel.playerSlots[t].country),
                      this.getColorIdByName(this.formModel.playerSlots[t].color),
                      e,
                      this.formModel.playerSlots[t].team,
                      t,
                    ),
                    this.updateFormModel());
                },
                onTeamSelect: (e, t) => {
                  this.wolCon.isOpen() &&
                    this.gameChannelName &&
                    (this.sendPlayerInfo(
                      this.getCountryIdByName(this.formModel.playerSlots[t].country),
                      this.getColorIdByName(this.formModel.playerSlots[t].color),
                      this.formModel.playerSlots[t].startPos,
                      e,
                      t,
                    ),
                    this.updateFormModel());
                },
                onSlotChange: (e, t, i) => {
                  this.wolCon.isOpen() && this.gameChannelName && this.changeSlotType(e, t, i);
                },
                onToggleShortGame: (t) => this.applyGameOption((e) => (e.shortGame = t)),
                onToggleMcvRepacks: (t) => this.applyGameOption((e) => (e.mcvRepacks = t)),
                onToggleCratesAppear: (t) => this.applyGameOption((e) => (e.cratesAppear = t)),
                onToggleSuperWeapons: (t) => this.applyGameOption((e) => (e.superWeapons = t)),
                onToggleBuildOffAlly: (t) => this.applyGameOption((e) => (e.buildOffAlly = t)),
                onToggleHostTeams: (t) => this.applyGameOption((e) => (e.hostTeams = t)),
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
                activeSlotIndex: -1,
                teamsAllowed: !0,
                teamsRequired: !1,
                playerSlots: [],
                shortGame: !0,
                mcvRepacks: !0,
                cratesAppear: !0,
                superWeapons: !0,
                buildOffAlly: !0,
                hostTeams: !1,
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
              }),
                this.playerReadyStatus.clear(),
                this.playerHasMapStatus.clear(),
                (this.messages.length = 0));
            }
            applyGameOption(e) {
              if (!this.hostMode) throw new Error("Can't change options when not a host");
              this.wolCon.isOpen()
                ? (e(this.gameOpts),
                  f.GameOptSanitizer.sanitize(this.gameOpts, this.rules),
                  this.updateFormModel(),
                  this.sendGameOpts(),
                  this.localPrefs.setItem(
                    p.StorageKey.PreferredGameOpts,
                    this.preferredHostOpts.applyGameOpts(this.gameOpts).serialize(),
                  ))
                : this.onWolClose();
            }
            changeSlotType(e, t, i) {
              if (!this.hostMode) throw new Error("Only host can change slot type");
              if (0 === t) throw new Error("Change slot type of host");
              var r = this.formModel.playerSlots[t];
              let s = this.slotsInfo[t];
              (r.occupation === e && s.type === C.SlotType.Player && void 0 === i) ||
                (r.occupation === c.SlotOccupation.Occupied &&
                  (s.type === C.SlotType.Player ? this.kickPlayer(s.name) : (this.gameOpts.aiPlayers[t] = void 0)),
                (r = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings),
                e === c.SlotOccupation.Closed
                  ? ((s.type = C.SlotType.Closed), this.preferredHostOpts.slotsClosed.add(t))
                  : e === c.SlotOccupation.Open
                    ? ((s.type = t === this.observerSlotIndex ? C.SlotType.OpenObserver : C.SlotType.Open),
                      this.preferredHostOpts.slotsClosed.delete(t))
                    : e === c.SlotOccupation.Occupied &&
                      void 0 !== i &&
                      ((s.type = C.SlotType.Ai),
                      (s.difficulty = i),
                      (this.gameOpts.aiPlayers[t] = {
                        difficulty: i,
                        countryId: d.RANDOM_COUNTRY_ID,
                        colorId: d.RANDOM_COLOR_ID,
                        startPos: d.RANDOM_START_POS,
                        teamId: r.mustAlly ? 3 : d.NO_TEAM_ID,
                      }),
                      this.preferredHostOpts.slotsClosed.delete(t)),
                this.updateFormModel(),
                this.sendGameSlotInfo(),
                this.sendGameOpts(),
                this.sendModeMaxSlots(),
                this.localPrefs.setItem(p.StorageKey.PreferredGameOpts, this.preferredHostOpts.serialize()));
            }
            getCountryNameById(e) {
              let t;
              return (
                (t =
                  e === d.RANDOM_COUNTRY_ID
                    ? d.RANDOM_COUNTRY_NAME
                    : e === d.OBS_COUNTRY_ID
                      ? d.OBS_COUNTRY_NAME
                      : this.getAvailablePlayerCountries()[e]),
                t
              );
            }
            getCountryIdByName(t) {
              let i;
              if (t === d.RANDOM_COUNTRY_NAME) i = d.RANDOM_COUNTRY_ID;
              else if (t === d.OBS_COUNTRY_NAME) i = d.OBS_COUNTRY_ID;
              else {
                let e = this.getAvailablePlayerCountries();
                i = e.indexOf(t);
              }
              return i;
            }
            getColorNameById(e) {
              let t;
              return ((t = e === d.RANDOM_COLOR_ID ? d.RANDOM_COLOR_NAME : this.getAvailablePlayerColors()[e]), t);
            }
            getColorIdByName(t) {
              let i;
              if (t === d.RANDOM_COLOR_NAME) i = d.RANDOM_COLOR_ID;
              else {
                let e = this.getAvailablePlayerColors();
                if (((i = e.indexOf(t)), -1 === i)) throw new Error(`Color ${t} not found in available player colors`);
              }
              return i;
            }
            sendPlayerInfo(t, i, r, s, a) {
              if (!this.hostPlayerName) throw new Error("Host player name not yet set.");
              if (this.hostMode) {
                if (void 0 !== a && a !== this.formModel.activeSlotIndex) {
                  const n = this.slotsInfo[a];
                  if (n.type !== C.SlotType.Ai && !this.gameOpts.hostTeams)
                    throw new Error("Can't change country and color for a non-AI slot");
                  let e = this.gameOpts.aiPlayers[a];
                  if (!e) {
                    if (!this.gameOpts.hostTeams) throw new Error("No AI found in slot " + a);
                    if (n.type !== C.SlotType.Player)
                      return void console.warn(`Can't change player info for ${C.SlotType[n.type]} slot at ` + a);
                    e = this.gameOpts.humanPlayers.find((e) => e.name === n.name);
                  }
                  if (!e) throw new Error("No human player found in slot " + a);
                  ((e.countryId = t), (e.colorId = i), (e.startPos = r), (e.teamId = s));
                } else this.updatePlayerInfo(this.hostPlayerName, t, i, r, s);
                (this.updateFormModel(), this.sendGameOpts());
              } else this.wolCon.sendPlayerOpts(this.hostPlayerName, t, i, r, s);
              (void 0 !== a && a !== this.formModel.activeSlotIndex) ||
                (t !== d.OBS_COUNTRY_ID &&
                  (t !== d.RANDOM_COUNTRY_ID
                    ? this.localPrefs.setItem(p.StorageKey.LastPlayerCountry, String(t))
                    : this.localPrefs.removeItem(p.StorageKey.LastPlayerCountry),
                  i !== d.RANDOM_COLOR_ID
                    ? this.localPrefs.setItem(p.StorageKey.LastPlayerColor, String(i))
                    : this.localPrefs.removeItem(p.StorageKey.LastPlayerColor)));
            }
            updatePlayerInfo(t, e, i, r, s, a = !1) {
              if (!this.hostMode) throw new Error("Method should only be used in host mode");
              let n = this.gameOpts.humanPlayers.find((e) => e.name === t);
              n
                ? ((n.countryId = e), (n.colorId = i), a || ((n.startPos = r), (n.teamId = s)))
                : console.error("Can't set country/color for non-existent player " + t);
            }
            updateFormModel() {
              var e = this.gameOpts;
              if (
                (e &&
                  ((this.formModel.gameSpeed = e.gameSpeed),
                  (this.formModel.credits = e.credits),
                  (this.formModel.unitCount = e.unitCount),
                  (this.formModel.shortGame = e.shortGame),
                  (this.formModel.superWeapons = e.superWeapons),
                  (this.formModel.buildOffAlly = e.buildOffAlly),
                  (this.formModel.hostTeams = e.hostTeams),
                  (this.formModel.mcvRepacks = e.mcvRepacks),
                  (this.formModel.cratesAppear = e.cratesAppear),
                  (this.formModel.destroyableBridges = e.destroyableBridges),
                  (this.formModel.multiEngineer = e.multiEngineer),
                  (this.formModel.noDogEngiKills = e.noDogEngiKills),
                  (this.formModel.instantCapture = e.instantCapture),
                  (this.formModel.delayedOils = e.delayedOils)),
                this.gameOpts && this.slotsInfo)
              ) {
                let i = e.maxSlots;
                (this.slotsInfo.forEach((e, t) => {
                  t !== this.observerSlotIndex
                    ? i
                      ? (i--,
                        (this.formModel.playerSlots[t] = {
                          country: d.RANDOM_COUNTRY_NAME,
                          color: d.RANDOM_COLOR_NAME,
                          startPos: d.RANDOM_START_POS,
                          team: d.NO_TEAM_ID,
                        }))
                      : (this.formModel.playerSlots[t] = void 0)
                    : (this.formModel.playerSlots[t] = {
                        country: d.RANDOM_COUNTRY_NAME,
                        color: d.RANDOM_COLOR_NAME,
                        startPos: d.RANDOM_START_POS,
                        team: d.NO_TEAM_ID,
                      });
                }),
                  this.slotsInfo.forEach((t, i) => {
                    if (this.formModel.playerSlots[i]) {
                      let e = this.formModel.playerSlots[i];
                      (t.type === C.SlotType.Closed
                        ? (e.occupation = c.SlotOccupation.Closed)
                        : t.type === C.SlotType.Open || t.type === C.SlotType.OpenObserver
                          ? (e.occupation = c.SlotOccupation.Open)
                          : (e.occupation = c.SlotOccupation.Occupied),
                        t.type === C.SlotType.OpenObserver || i === this.observerSlotIndex
                          ? (e.type = c.SlotType.Observer)
                          : t.type === C.SlotType.Ai
                            ? (e.type = c.SlotType.Ai)
                            : (e.type = c.SlotType.Player),
                        t.type === C.SlotType.Ai
                          ? ((e.aiDifficulty = t.difficulty), (e.status = c.PlayerStatus.Ready))
                          : t.type === C.SlotType.Player &&
                            ((e.name = t.name),
                            t.name === this.hostPlayerName
                              ? (e.status = c.PlayerStatus.Host)
                              : (e.status = this.playerReadyStatus.get(t.name)
                                  ? c.PlayerStatus.Ready
                                  : c.PlayerStatus.NotReady)));
                    }
                  }));
              }
              let s = this.gameOpts ? this.gameOpts.humanPlayers : [],
                a = this.gameOpts ? this.gameOpts.aiPlayers : [],
                n = this.gameOpts ? this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings : void 0;
              (this.formModel.playerSlots.forEach((t, e) => {
                var i, r;
                t &&
                  s.length &&
                  (t.occupation === c.SlotOccupation.Occupied
                    ? ((i = s.find((e) => e.name === t.name))
                        ? ((t.country = this.getCountryNameById(i.countryId)),
                          (t.color = this.getColorNameById(i.colorId)),
                          (t.startPos = i.startPos),
                          (t.team = i.teamId))
                        : (r = a[e]) &&
                          ((t.country = this.getCountryNameById(r.countryId)),
                          (t.color = this.getColorNameById(r.colorId)),
                          (t.startPos = r.startPos),
                          (t.team = r.teamId)),
                      (r = this.playerPings.find((e) => !!t.name && e.playerName === t.name)) &&
                        (t.ping = 0 < r.ping ? r.ping : void 0),
                      this.playerProfiles &&
                        t.type === c.SlotType.Player &&
                        (t.playerProfile = this.playerProfiles.get(t.name)))
                    : e === this.observerSlotIndex
                      ? (t.country = d.OBS_COUNTRY_NAME)
                      : ((t.country = d.RANDOM_COUNTRY_NAME), n && (t.team = n.mustAlly ? 3 : d.NO_TEAM_ID)));
              }),
                this.hostMode ||
                  (this.formModel.activeSlotIndex = this.slotsInfo
                    ? this.slotsInfo.findIndex(
                        (e) => e.type === C.SlotType.Player && e.name === this.wolCon.getCurrentUser(),
                      )
                    : -1),
                (this.formModel.availablePlayerColors = this.getSelectablePlayerColors()),
                (this.formModel.availableStartPositions = this.getSelectableStartPositions()),
                this.gameOpts &&
                  ((this.formModel.teamsAllowed = this.gameModes.getById(e.gameMode).mpDialogSettings.alliesAllowed),
                  (this.formModel.teamsRequired = this.gameModes.getById(e.gameMode).mpDialogSettings.mustAlly)),
                this.lobbyForm && s.length && this.lobbyForm.refresh());
            }
            addSystemMessage(e, t = !1) {
              this.lobbyForm && (this.messages.push({ text: e, untrustedContent: t }), this.lobbyForm.refresh());
            }
            sendGameOpts() {
              if (!this.hostMode) throw new Error("Should only be used in host mode");
              var e, t, i;
              this.gameOpts &&
                this.wolCon.isOpen() &&
                this.gameChannelName &&
                (this.gameOpts.humanPlayers.forEach((e) => {
                  -1 === e.colorId && (e.colorId = d.RANDOM_COLOR_ID);
                }),
                (i = this.gameOptSerializer.serializeOptions(this.gameOpts)),
                this.wolCon.sendGameOpts(i),
                (e = this.slotsInfo.filter(
                  (e) =>
                    e.type === C.SlotType.Ai ||
                    e.type === C.SlotType.Player ||
                    e.type === C.SlotType.Open ||
                    e.type === C.SlotType.OpenObserver,
                ).length),
                (t = this.slotsInfo.filter((e) => e.type === C.SlotType.Player).length),
                (i = this.activeModMeta
                  ? this.activeModMeta.name +
                    (void 0 !== this.activeModMeta.version ? ` (${this.activeModMeta.version})` : "")
                  : void 0),
                this.wolCon.sendGameTopic(
                  t,
                  e,
                  this.gameOpts.aiPlayers.filter((e) => !!e).length,
                  Number(this.slotsInfo[this.observerSlotIndex].type === C.SlotType.Player),
                  this.slotsInfo[this.observerSlotIndex].type === C.SlotType.OpenObserver,
                  this.gameOpts.mapName,
                  this.engineModHash,
                  this.hostRoomDesc,
                  i,
                ),
                this.sendPingData());
            }
            handlePlayerJoinLeave(i) {
              if (!this.hostMode) throw new Error("Should only be used in host mode");
              if (this.wolCon.isOpen() && this.gameChannelName && this.slotsInfo) {
                if ("join" === i.type) {
                  let e = this.slotsInfo.findIndex((e) => e.type === C.SlotType.Open),
                    t = !1;
                  if (
                    -1 === e &&
                    ((e = this.slotsInfo.findIndex((e) => e.type === C.SlotType.OpenObserver)), (t = !0), -1 === e)
                  )
                    return void this.kickPlayer(i.user.name);
                  this.slotsInfo[e] = { type: C.SlotType.Player, name: i.user.name };
                  var r,
                    s = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
                  (this.gameOpts.humanPlayers.push({
                    name: i.user.name,
                    countryId: t ? d.OBS_COUNTRY_ID : d.RANDOM_COUNTRY_ID,
                    colorId: t ? d.OBS_COLOR_ID : d.RANDOM_COLOR_ID,
                    startPos: d.RANDOM_START_POS,
                    teamId: s.mustAlly ? 0 : d.NO_TEAM_ID,
                  }),
                    this.playerReadyStatus.set(i.user.name, !1));
                  for (r of this.playerReadyStatus.keys()) this.playerReadyStatus.set(r, !1);
                } else this.removeHumanPlayer(i.user.name);
                (this.sendGameSlotInfo(), this.sendObserverSlotInfo(), this.sendGameOpts());
              }
            }
            removeHumanPlayer(t) {
              var i = this.slotsInfo.findIndex((e) => e.type === C.SlotType.Player && e.name === t);
              if (-1 !== i) {
                let e = this.slotsInfo[i];
                i === this.observerSlotIndex ? (e.type = C.SlotType.OpenObserver) : (e.type = C.SlotType.Open);
              }
              i = this.gameOpts.humanPlayers.findIndex((e) => e.name === t);
              (-1 !== i && this.gameOpts.humanPlayers.splice(i, 1),
                this.playerReadyStatus.delete(t),
                this.playerHasMapStatus.delete(t));
              i = this.playerPings.findIndex((e) => e.playerName === t);
              -1 !== i && this.playerPings.splice(i, 1);
            }
            kickPlayer(e, t) {
              this.gameChannelName &&
                this.wolCon.isInChannel(this.gameChannelName) &&
                (this.wolCon.kick([e], this.gameChannelName, t), this.removeHumanPlayer(e));
            }
            sendObserverSlotInfo() {
              this.wolCon.sendObserverSlot(this.observerSlotIndex);
            }
            sendGameSlotInfo() {
              var e;
              this.wolCon.isOpen() &&
                this.gameChannelName &&
                ((e = this.gameOptSerializer.serializeSlotData(this.slotsInfo)), this.wolCon.sendGameSlotsInfo(e));
            }
            sendPingData() {
              var e;
              this.playerPings.length &&
                ((e = this.gameOptSerializer.serializePingData(this.playerPings)), this.wolCon.sendPingData(e));
            }
            sendModeMaxSlots() {
              if (!this.hostMode) throw new Error("Must be in host mode");
              if (!this.slotsInfo) throw new Error("Slots info should be set by now");
              var e = this.gameChannelName;
              if (!e || !this.wolCon.isInChannel(e)) throw new Error("Must be in a game channel");
              var t = this.slotsInfo.filter((e) => e.type !== C.SlotType.Closed && e.type !== C.SlotType.Ai).length;
              this.wolCon.sendModeChannelMax(e, t);
            }
            updatePlayerPing(t, e) {
              let i = this.playerPings.find((e) => e.playerName === t);
              i ? (i.ping = e) : this.playerPings.push({ ping: e, playerName: t });
            }
            handlePlayerOptsChange(s, a) {
              var n = this.slotsInfo.findIndex((e) => e.type === C.SlotType.Player && e.name === s);
              if (-1 !== n) {
                let [e, t, i, r] = a.slice(1).split(",").map(Number);
                ((t = this.getSelectablePlayerColors().includes(this.getColorNameById(t))
                  ? t
                  : this.gameOpts.humanPlayers.find((e) => e.name === s).colorId),
                  (i = this.getSelectableStartPositions().includes(i)
                    ? i
                    : this.gameOpts.humanPlayers.find((e) => e.name === s).startPos));
                var o = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
                ((r = !o.alliesAllowed || (r === d.NO_TEAM_ID && o.mustAlly) ? (o.mustAlly ? 0 : d.NO_TEAM_ID) : r),
                  e === d.OBS_COUNTRY_ID || n !== this.observerSlotIndex
                    ? (this.updatePlayerInfo(s, e, t, i, r, this.gameOpts.hostTeams),
                      this.sendGameOpts(),
                      e === d.OBS_COUNTRY_ID &&
                        ((o = this.slotsInfo[this.observerSlotIndex]).type !== C.SlotType.OpenObserver
                          ? (o.type === C.SlotType.Player && o.name === s) ||
                            (console.warn(`Player ${s} tried to move to an unavailable observer slot`),
                            this.kickPlayer(s))
                          : ((this.slotsInfo[this.observerSlotIndex] = this.slotsInfo[n]),
                            (this.slotsInfo[n] = { type: C.SlotType.Open }),
                            this.sendGameSlotInfo())))
                    : this.kickPlayer(s));
              }
            }
            handleGameOptReady(t, e) {
              if (this.slotsInfo) {
                var i = this.slotsInfo.findIndex((e) => e.type === C.SlotType.Player && e.name === t);
                if (-1 === i && this.hostMode) return;
              }
              (this.playerReadyStatus.set(t, Boolean(Number(e))),
                this.hostMode ||
                  t !== this.wolCon.getCurrentUser() ||
                  (Number(e) && (this.acceptButtonFlashing = !1), this.refreshSidebarButtons()),
                this.hostMode &&
                  ![...this.playerReadyStatus.values()].filter((e) => !1 === e).length &&
                  this.sound.play(M.SoundKey.OptionsChanged, R.ChannelType.Ui));
            }
            handleGameOptHasMap(t, e) {
              if (this.slotsInfo) {
                var i = this.slotsInfo.findIndex((e) => e.type === C.SlotType.Player && e.name === t);
                if (-1 === i && this.hostMode) return;
              }
              let r = Number(e);
              (Object.values(E.WolHasMapStatus).includes(r) || (r = E.WolHasMapStatus.NoMap),
                this.playerHasMapStatus.set(t, r),
                this.hostMode || t !== this.wolCon.getCurrentUser()
                  ? r !== E.WolHasMapStatus.HasMap &&
                    this.gameOpts &&
                    this.messages.push({
                      untrustedContent: !0,
                      text:
                        r === E.WolHasMapStatus.MapTransfer
                          ? this.strings.get("GUI:HostMapTransfer", t, `"${this.gameOpts.mapTitle}"`)
                          : this.strings.get("GUI:HostNoMap", t, `"${this.gameOpts.mapTitle}"`) +
                            (this.hostIsFreshAccount ? " " + this.strings.get("GUI:HostNoMapUpload") : ""),
                    })
                  : this.refreshSidebarButtons());
            }
            handleGameOptObserver(e) {
              this.observerSlotIndex = Number(e);
            }
            handleGameOptSlots(e) {
              this.slotsInfo = this.gameOptParser.parseSlotData(e);
            }
            handleGameOptPing(e) {
              this.playerPings = this.gameOptParser.parsePingData(e);
            }
            handleGameOptOptions(e) {
              var t, i;
              this.gameChannelName &&
                this.wolCon.isInChannel(this.gameChannelName) &&
                ((i =
                  (t = this.gameOptParser.parseOptions(e)).mapName !== this.gameOpts?.mapName ||
                  t.mapDigest !== this.gameOpts?.mapDigest),
                f.GameOptSanitizer.sanitize(t, this.rules),
                (this.gameOpts = t),
                this.refreshSidebarMpText(),
                i &&
                  this.wolCon.isOpen() &&
                  ((i = this.wolCon.getCurrentUser()),
                  this.playerReadyStatus.set(i, !1),
                  this.playerHasMapStatus.set(i, E.WolHasMapStatus.NoMap),
                  this.refreshSidebarButtons(),
                  this.wolCon.sendPlayerReady(!1),
                  this.guestUpdateMapDeferred(t)));
            }
            guestUpdateMapDeferred(s) {
              (this.mapLoadTask?.cancel(),
                (this.mapLoadTask = new w.Task(async (e) => {
                  (this.controller.setSidebarPreview(), (this.currentMapFile = void 0));
                  var t,
                    i,
                    r = (this.currentMapFile = await this.loadAndCheckMap(s));
                  !e.isCancelled() &&
                    this.wolCon.isOpen() &&
                    ((t =
                      !r &&
                      !s.mapOfficial &&
                      !this.hostIsFreshAccount &&
                      s.mapSizeBytes <= (this.mapTransferService.getUrl() ? S : b).MAX_MAP_TRANSFER_BYTES),
                    (i = r ? E.WolHasMapStatus.HasMap : t ? E.WolHasMapStatus.MapTransfer : E.WolHasMapStatus.NoMap),
                    this.wolCon.sendPlayerHasMap(i),
                    r
                      ? this.updateMapPreview(r)
                      : this.addSystemMessage(
                          t
                            ? this.strings.get("GUI:JoinerMapTransfer", `"${s.mapTitle}"`)
                            : this.hostIsFreshAccount
                              ? this.strings.get("GUI:HostNoMapUpload")
                              : this.strings.get("GUI:JoinerNoMap", `"${s.mapTitle}"`),
                          !0,
                        ),
                    this.refreshSidebarMpText());
                })),
                this.mapLoadTask.start().catch((e) => {
                  e instanceof A.OperationCanceledError || this.handleError(e, this.strings.get("TXT_DOWNLOAD_FAILED"));
                }));
            }
            updateMapPreview(e) {
              try {
                var t = new l.MapPreviewRenderer(this.strings).render(
                  new T.MapFile(e),
                  this.hostMode ? c.LobbyType.MultiplayerHost : c.LobbyType.MultiplayerGuest,
                  this.controller.getSidebarPreviewSize(),
                );
                this.controller.setSidebarPreview(t);
              } catch (e) {
                (console.error("Failed to render map preview"), console.error(e), this.controller.setSidebarPreview());
              }
            }
            async loadAndCheckMap(t) {
              if (this.mapList.getByName(t.mapName)) {
                let e = await this.mapFileLoader.load(t.mapName);
                return v.MapDigest.compute(e) === t.mapDigest && e.getSize() === t.mapSizeBytes ? e : void 0;
              }
            }
            initLobbyForm() {
              var [e] = this.jsxRenderer.render(
                n.jsx(o.HtmlView, {
                  innerRef: (e) => (this.lobbyForm = e),
                  component: r.LobbyForm,
                  props: this.formModel,
                }),
              );
              this.controller.setMainComponent(e);
            }
            refreshSidebarButtons() {
              let e = this.strings,
                t = this.playerReadyStatus.get(this.wolCon.getCurrentUser());
              var i = this.playerHasMapStatus.get(this.wolCon.getCurrentUser()) ?? E.WolHasMapStatus.NoMap,
                i = [
                  this.hostMode
                    ? {
                        label: e.get("GUI:StartGame"),
                        tooltip: e.get("STT:HostButtonGo"),
                        disabled: !1,
                        onClick: () => {
                          var e;
                          this.wolCon.isOpen() &&
                            (void 0 !==
                            (e = [...this.playerHasMapStatus].find(([, e]) => e === E.WolHasMapStatus.NoMap)?.[0])
                              ? this.addSystemMessage(
                                  this.strings.get("GUI:HostNoMap", e, `"${this.gameOpts.mapTitle}"`) +
                                    (this.hostIsFreshAccount ? " " + this.strings.get("GUI:HostNoMapUpload") : ""),
                                  !0,
                                )
                              : this.gameOpts.humanPlayers.filter((e) => e.countryId !== d.OBS_COUNTRY_ID).length < 2
                                ? this.addSystemMessage(this.strings.get("TXT_ONLY_ONE"))
                                : this.meetsMinimumTeams()
                                  ? [...this.playerReadyStatus.values()].filter((e) => !1 === e).length
                                    ? (this.addSystemMessage(this.strings.get("GUI:HostGameStartHost")),
                                      this.wolCon.sendGameStartRequest())
                                    : ((this.frozenGameOpts = this.gameOptParser.parseOptions(
                                        this.gameOptSerializer.serializeOptions(this.gameOpts),
                                      )),
                                      this.wolCon.startGame(this.gameOpts.humanPlayers.map((e) => e.name)))
                                  : this.addSystemMessage(this.strings.get("TXT_CANNOT_ALLY")));
                        },
                      }
                    : {
                        label: t ? e.get("GUI:NotReady") : e.get("GUI:Accept"),
                        tooltip: t ? e.get("STT:NotReady") : e.get("STT:GuestButtonAccept"),
                        disabled: i === E.WolHasMapStatus.NoMap,
                        flashing: !t && this.acceptButtonFlashing,
                        onClick: () => {
                          this.wolCon.isOpen() &&
                            this.gameChannelName &&
                            (this.playerReadyStatus.set(this.wolCon.getCurrentUser(), !t),
                            this.wolCon.sendPlayerReady(!t));
                        },
                      },
                  ...(this.hostMode
                    ? [
                        {
                          label: e.get("GUI:ChooseMap"),
                          tooltip: e.get("STT:HostButtonChooseMap"),
                          onClick: () => {
                            this.controller?.pushScreen(x.ScreenType.MapSelection, {
                              lobbyType: this.hostMode ? c.LobbyType.MultiplayerHost : c.LobbyType.MultiplayerGuest,
                              gameOpts: this.gameOpts,
                              usedSlots: () =>
                                1 +
                                g.findIndexReverse(
                                  this.slotsInfo,
                                  (e, t) =>
                                    e.type === C.SlotType.Ai ||
                                    (e.type === C.SlotType.Player && this.observerSlotIndex !== t),
                                ) -
                                (0 === this.observerSlotIndex ? 1 : 0),
                            });
                          },
                        },
                      ]
                    : []),
                  {
                    label: e.get("GUI:Back"),
                    tooltip: this.hostMode ? e.get("STT:HostButtonBack") : e.get("STT:GuestButtonBack"),
                    isBottom: !0,
                    onClick: () => {
                      this.controller?.goToScreen(x.ScreenType.CustomGame, {});
                    },
                  },
                ];
              (this.controller.setSidebarButtons(i, !0), this.refreshSidebarMpText());
            }
            meetsMinimumTeams() {
              let e = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
                  .filter(P.isNotNullOrUndefined)
                  .filter((e) => e.countryId !== d.OBS_COUNTRY_ID),
                t = e[0].teamId;
              return t === d.NO_TEAM_ID || e.some((e) => e.teamId !== t);
            }
            refreshSidebarMpText() {
              this.gameOpts
                ? this.controller.setSidebarMpContent({
                    text:
                      this.strings.get(this.gameModes.getById(this.gameOpts.gameMode).label) +
                      "\n\n" +
                      (this.hostMode || !this.hostIsFreshAccount || this.currentMapFile
                        ? this.gameOpts.mapTitle
                        : this.strings.get("GUI:CustomMap")),
                    icon: this.gameOpts.mapOfficial ? "gt18.pcx" : "settings.png",
                    tooltip: this.gameOpts.mapOfficial
                      ? this.strings.get("STT:VerifiedMap")
                      : this.strings.get("STT:UnverifiedMap"),
                  })
                : this.controller.setSidebarMpContent({ text: "" });
            }
            async onLeave() {
              (this.wolCon.isOpen() &&
                this.wolCon.getCurrentUser() &&
                this.gameChannelName &&
                this.wolCon.leaveChannel(this.gameChannelName),
                this.disposables.dispose(),
                this.mapLoadTask?.cancel(),
                (this.mapLoadTask = void 0),
                this.ranksUpdateTask?.cancel(),
                (this.ranksUpdateTask = void 0),
                this.pingsUpdateTask?.cancel(),
                (this.pingsUpdateTask = void 0),
                this.gservPingUpdateTask?.cancel(),
                (this.gservPingUpdateTask = void 0),
                (this.currentMapFile = void 0),
                (this.gameChannelName = void 0),
                (this.hostPlayerName = void 0),
                (this.hostIsFreshAccount = void 0),
                (this.hostRoomDesc = ""),
                (this.gameOpts = void 0),
                (this.frozenGameOpts = void 0),
                (this.preferredHostOpts = void 0),
                (this.playerPings = this.slotsInfo = void 0),
                this.playerProfiles.clear(),
                (this.currentGameServer = void 0),
                (this.acceptButtonFlashing = !1),
                this.hostOptsIntervalId && clearInterval(this.hostOptsIntervalId),
                this.gservPingIntervalId && clearInterval(this.gservPingIntervalId),
                this.wolCon.onGameOpt.unsubscribe(this.handleGameOpt),
                this.wolCon.onGameStart.unsubscribe(this.handleGameStart),
                this.wolCon.onGameServer.unsubscribe(this.handleGameServer),
                this.wolCon.onLeaveChannel.unsubscribe(this.onChannelLeave),
                this.wolCon.onJoinChannel.unsubscribe(this.onChannelJoin),
                this.wolCon.onChatMessage.unsubscribe(this.onChannelMessage),
                this.wolCon.onClose.unsubscribe(this.onWolClose),
                this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate),
                this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost),
                this.controller.toggleSidebarPreview(!1),
                await this.unrender());
            }
            async unrender() {
              (await this.controller.hideSidebarButtons(), this.lobbyForm && (this.lobbyForm = void 0));
            }
          }),
          e("LobbyScreen", D),
          __decorate([j.Throttle(5e3)], D.prototype, "updateGservPing", null),
          __decorate([j.Throttle(350)], D.prototype, "sendGameOpts", null),
          __decorate([j.Throttle(350)], D.prototype, "sendGameSlotInfo", null));
      },
    };
  },
);
