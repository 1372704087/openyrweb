// === Reconstructed SystemJS module: gui/screen/mainMenu/quickGame/QuickGameScreen ===
// deps: ["@puzzl/core/lib/async/Task","@puzzl/core/lib/async/cancellation","gui/jsx/jsx","gui/jsx/HtmlView","engine/sound/Music","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/ScreenType","util/disposable/CompositeDisposable","game/gameopts/constants","engine/sound/SoundKey","engine/sound/ChannelType","gui/screen/mainMenu/MainMenuRoute","gui/screen/mainMenu/quickGame/PartyState","gui/screen/mainMenu/quickGame/component/QuickGameForm","LocalPrefs","network/ladder/WLadderService","network/ladder/wladderConfig","network/WolError","network/qmCodes","network/partyCodes","gui/screen/mainMenu/quickGame/ChatUi","gui/component/PartyInviteDialog"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/quickGame/QuickGameScreen",
  [
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/cancellation",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "engine/sound/Music",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/screen/mainMenu/ScreenType",
    "util/disposable/CompositeDisposable",
    "game/gameopts/constants",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "gui/screen/mainMenu/MainMenuRoute",
    "gui/screen/mainMenu/quickGame/PartyState",
    "gui/screen/mainMenu/quickGame/component/QuickGameForm",
    "LocalPrefs",
    "network/ladder/WLadderService",
    "network/ladder/wladderConfig",
    "network/WolError",
    "network/qmCodes",
    "network/partyCodes",
    "gui/screen/mainMenu/quickGame/ChatUi",
    "gui/component/PartyInviteDialog",
  ],
  function (t, e) {
    "use strict";
    var i, n, a, o, y, r, T, v, l, b, S, w, E, s, c, h, C, u, x, O, d, g, A, p;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          l = e;
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
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        var e;
        (((e = A = A || {})[(e.None = 0)] = "None"),
          (e[(e.Initializing = 1)] = "Initializing"),
          (e[(e.WaitingForMatch = 2)] = "WaitingForMatch"),
          (e[(e.WaitingForStartTimer = 3)] = "WaitingForStartTimer"),
          (e[(e.WaitingForGameStart = 4)] = "WaitingForGameStart"),
          (p = class extends r.MainMenuScreen {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f) {
              (super(),
                (this.unrankedEnabled = e),
                (this.engineVersion = t),
                (this.engineModHash = i),
                (this.clientLocale = r),
                (this.rules = s),
                (this.wolService = a),
                (this.wolCon = n),
                (this.wladderService = o),
                (this.serverRegions = l),
                (this.rootController = c),
                (this.messageBoxApi = h),
                (this.uiScene = u),
                (this.jsxRenderer = d),
                (this.strings = g),
                (this.localPrefs = p),
                (this.sound = m),
                (this.errorHandler = f),
                (this.title = this.strings.get("GUI:WolMatch")),
                (this.musicType = y.MusicType.NormalShuffle),
                (this.partySize = 1),
                (this.partyState = this.getInitialPartyState()),
                (this.userHasDeclinedInvitesFrom = new Set()),
                (this.availableQueueTypes = Object.values(C.LadderQueueType)),
                (this.playButtonFlashing = !1),
                (this.noInvites = !1),
                (this.disposables = new v.CompositeDisposable()),
                (this.handleChatMessage = (i) => {
                  if (i.text.startsWith(x.RPL_QUEUE_LIST + " ") && this.queueState === A.None) {
                    let e = i.text.split(" ").slice(1).join(" "),
                      t = e.split(",").filter((e) => Object.values(C.LadderQueueType).includes(e));
                    ((this.availableQueueTypes = t),
                      !t.includes(this.queueOpts.type) &&
                        t.length &&
                        ((this.queueOpts.type = t[0]), this.form && this.requestPlayerProfileRefresh()),
                      this.form?.applyOptions((e) => {
                        ((e.enabledTypes = t), (e.type = this.queueOpts.type));
                      }));
                  }
                  if (this.queueState !== A.None && i.from === this.wolConfig.getQuickMatchBotName())
                    if (
                      [x.RPL_WORKING, x.RPL_BAD_VERS, x.RPL_BAD_HASH, x.RPL_MODE_UNAVAIL, x.RPL_RATE_LIMITED].includes(
                        i.text,
                      )
                    )
                      if (this.queueState === A.Initializing)
                        if (i.text === x.RPL_WORKING) this.updateQueueState(A.WaitingForMatch);
                        else {
                          let e,
                            t = !0;
                          (i.text === x.RPL_BAD_VERS
                            ? (e = this.strings.get("TS:OutdatedClient"))
                            : i.text === x.RPL_BAD_HASH
                              ? (e = this.strings.get("TXT_MISMATCH"))
                              : i.text === x.RPL_MODE_UNAVAIL
                                ? ((e = this.strings.get("WOL:MatchModeUnavail")), (t = !1))
                                : i.text === x.RPL_RATE_LIMITED
                                  ? ((e = this.strings.get("WOL:MatchQueueJoinRateLimit")), (t = !1))
                                  : (e = this.strings.get("WOL:MatchBadParameters")),
                            t || this.leaveQueue(),
                            this.handleError(i.text, e, { fatal: t }));
                        }
                      else console.warn(`Unexpected reply "${i.text}" from match bot (qs: ${A[this.queueState]})`);
                    else if (i.text.startsWith(x.RPL_MATCHED + " "))
                      this.queueState === A.WaitingForMatch
                        ? (this.sound.play(b.SoundKey.PlayerJoined, S.ChannelType.Ui),
                          (t = i.text.split(" ")[1]),
                          (this.countdownSeconds = Number(t)),
                          this.updateQueueState(A.WaitingForStartTimer))
                        : console.warn(`Unexpected reply "${i.text}" from match bot (qs: ${A[this.queueState]})`);
                    else if (i.text === x.RPL_REQUEUE)
                      [A.WaitingForGameStart, A.WaitingForStartTimer].includes(this.queueState) &&
                        (console.log("A player left. Returned to queue."), this.updateQueueState(A.WaitingForMatch));
                    else if (i.text === x.RPL_REMOVED_FROM_QUEUE)
                      (this.quickMatchChannelName &&
                        (this.wolCon.leaveChannel(this.quickMatchChannelName), (this.quickMatchChannelName = void 0)),
                        this.updateQueueState(A.None),
                        this.partyState.partyId &&
                          ((this.partyState.status = E.PartyStatus.Idle),
                          this.partyState.members.forEach((e) => (e.ready = !1)),
                          (this.playButtonFlashing = !1),
                          this.updatePartyUI()));
                    else if (i.text.startsWith(x.RPL_STATS + " ") && this.queueState === A.WaitingForMatch)
                      if (this.isWaitingForTeammate())
                        this.updateSidebarText(this.strings.get("GUI:WaitingForTeammate"));
                      else {
                        let e = i.text.split(" ").slice(1).join(" ");
                        var [, t] = e.split(","),
                          t = "-1" !== t ? Number(t) : void 0;
                        this.updateSidebarText(
                          this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type) +
                            "\n\n" +
                            this.strings.get("WOL:MatchAvgWaitTime") +
                            "\n" +
                            (void 0 !== t && t < 3600
                              ? this.strings.get("WOL:MatchAvgWaitTimeMinutes", t < 60 ? "<1" : "~" + Math.ceil(t / 60))
                              : this.strings.get("WOL:MatchAvgWaitTimeUnavail")),
                        );
                      }
                }),
                (this.handleLeaveChannel = async (e) => {
                  e.user.name === this.wolCon.getCurrentUser() &&
                    e.channel === this.quickMatchChannelName &&
                    ((this.quickMatchChannelName = void 0),
                    this.queueState !== A.None && (this.updateQueueState(A.None), this.wolCon.close()));
                }),
                (this.handleGameStart = async (e) => {
                  if (this.queueState === A.WaitingForGameStart || this.queueState === A.WaitingForStartTimer)
                    try {
                      var t = this.wolCon.getCurrentUser();
                      if (void 0 === t) throw new Error("User should be logged in");
                      this.updateQueueState(A.None);
                      var i = new w.MainMenuRoute(T.ScreenType.Login, {
                        afterLogin: (e) => new w.MainMenuRoute(T.ScreenType.QuickGame, { messages: e }),
                      });
                      (this.form || (await this.controller?.popScreen()),
                        this.rootController.joinGame(e.gameId, e.timestamp, e.gservUrl, t, !0, !1, i));
                    } catch (e) {
                      if ((this.leaveQueue(), !this.wolCon.isOpen())) return;
                      this.handleError(e, this.strings.get("WOL:MatchTimeout"), { fatal: !1 });
                    }
                }),
                (this.onWolClose = () => {
                  this.updateQueueState(A.None);
                }),
                (this.onWolConLost = (e) => {
                  this.handleError(e, this.strings.get("TXT_YOURE_DISCON"), { fatal: !0 });
                }),
                (this.handlePartyUpdate = (e) => {
                  const t = e.split(" ");
                  var i = t[0];
                  if (i === O.RPL_PARTY_INVITE) {
                    console.log("Party invite received from " + t[1]);
                    var r = t[1];
                    if (r)
                      return this.queueState !== A.None
                        ? (this.wolCon.partyDecline(r),
                          void console.warn(`Ignoring party invite from ${r}: currently in queue`))
                        : void (this.partyState.partyId
                            ? console.warn(`Ignoring party invite from ${r}: already in a party`)
                            : this.showInviteDialog(r));
                    console.warn("Party invite received but inviter name is missing");
                  } else if (i === O.RPL_PARTY_UPDATE) {
                    var s = t[1];
                    const u = t[2]?.split(",") || [];
                    var a = t[3] === E.PartyStatus.Queued ? E.PartyStatus.Queued : E.PartyStatus.Idle;
                    const d = "1" === t[4],
                      g = "1" === t[5];
                    var n = u.map((e, t) => ({ name: e, ready: 0 === t ? d : g })),
                      r = this.wolCon.getCurrentUser();
                    void 0 !== r &&
                      ((o = n[(r = u.indexOf(r))]?.ready ?? !1),
                      (o = (n[1 - r]?.ready ?? !1) && !o && a !== E.PartyStatus.Queued) &&
                        !this.playButtonFlashing &&
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:TeammateWantsToStart")),
                      (this.playButtonFlashing = o),
                      (this.partyState = { partyId: s, members: n, status: a }),
                      (o = 2 !== this.partySize),
                      (this.partySize = u.length),
                      2 === this.partySize &&
                        this.queueOpts.type !== C.LadderQueueType.Team2v2 &&
                        (o && this.savePrePartyQueueType(), (this.queueOpts.type = C.LadderQueueType.Team2v2)),
                      this.updatePartyUI(),
                      this.queueState === A.WaitingForMatch &&
                        this.updateSidebarText(
                          this.isWaitingForTeammate()
                            ? this.strings.get("GUI:WaitingForTeammate")
                            : this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type),
                        ));
                  } else if (i === O.RPL_PARTY_LEFT) {
                    a = t[1];
                    (this.leaveQueue(), this.restorePrePartyQueueType(), this.resetPartyState(), this.updatePartyUI());
                    var o = this.wolCon.getCurrentUser();
                    o &&
                      (a === o
                        ? this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyLeft"))
                        : a &&
                          (this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyMemberLeft", a)),
                          this.messageBoxApi.show(this.strings.get("GUI:PartyDisbanded"), this.strings.get("GUI:OK"))));
                  } else if (i === O.RPL_PARTY_INVITE_DECLINED) {
                    var l = t[1];
                    this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteDeclinedBy", l));
                  } else if (i === O.RPL_PARTY_INVITE_EXPIRED)
                    this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteExpired"));
                  else if (i === O.RPL_PARTY_INVITE_SENT) {
                    l = t[1];
                    this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteSent", l));
                  } else if (i === O.RPL_PARTY_FORMED) {
                    var c = t[1];
                    (this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyFormedWith", c)),
                      this.sound.play(b.SoundKey.PartyFormed, S.ChannelType.Ui));
                  } else if (i === O.RPL_PARTY_INVITE_PREVENTION) {
                    c = t[1];
                    "1" === t[2] &&
                      this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInvitePreventionEnabled", c));
                  } else if (i === O.RPL_PARTY_INVITE_ERROR) {
                    var i = t[1],
                      h = t[2];
                    switch (i) {
                      case O.ERR_TARGET_IN_PARTY:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteAlreadyInParty", h));
                        break;
                      case O.ERR_TARGET_IN_QUEUE:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteInQueue", h));
                        break;
                      case O.ERR_INVITER_IN_PARTY:
                      case O.ERR_ACCEPTER_IN_PARTY:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteYouInParty"));
                        break;
                      case O.ERR_INVITE_PREVENTED:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInvitePrevented", h));
                        break;
                      case O.ERR_TARGET_NO_INVITES:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteNoInvites", h));
                        break;
                      case O.ERR_INVITE_ALREADY_PENDING:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteAlreadyPending", h));
                        break;
                      case O.ERR_NO_INVITE:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteNoInvite"));
                        break;
                      case O.ERR_TARGET_NOT_IN_QUICK_MATCH:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteNotInQuickMatch", h));
                        break;
                      case O.ERR_TARGET_SELF:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteTargetSelf"));
                        break;
                      case O.ERR_INVITER_FRESH_ACCOUNT:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteInviterFreshAccount"));
                        break;
                      default:
                        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyInviteFailed", h));
                    }
                  }
                }));
            }
            async onEnter(i) {
              (this.updateQueueState(A.None), this.resetPartyState());
              var e = this.localPrefs.getItem(c.StorageKey.LastPlayerCountry),
                r = this.localPrefs.getItem(c.StorageKey.LastPlayerColor),
                t = this.localPrefs.getItem(c.StorageKey.LastQueueRanked),
                s = this.localPrefs.getItem(c.StorageKey.LastQueueType),
                a = this.localPrefs.getItem(c.StorageKey.PartyNoInvites);
              this.noInvites = "1" === a;
              ((e =
                void 0 !== e && Number(e) < this.getAvailablePlayerCountries().length
                  ? Number(e)
                  : l.RANDOM_COUNTRY_ID),
                (r =
                  void 0 !== r && Number(r) < this.getAvailablePlayerColors().length ? Number(r) : l.RANDOM_COLOR_ID),
                (t = void 0 === t || !this.unrankedEnabled || Boolean(Number(t))),
                (s = void 0 !== s && Object.values(C.LadderQueueType).includes(s) ? s : C.LadderQueueType.Solo1v1));
              if (
                ((this.queueOpts = { type: s, ranked: t, countryId: e, colorId: r }),
                (this.playerProfile = void 0),
                this.controller.toggleMainVideo(!1),
                this.wolService.isConnected() && this.wolCon.getCurrentUser())
              ) {
                ((this.wolConfig = this.wolService.getConfig()),
                  this.wolCon.onClose.subscribe(this.onWolClose),
                  this.disposables.add(() => this.wolCon.onClose.unsubscribe(this.onWolClose)),
                  this.wolService.onWolConnectionLost.subscribe(this.onWolConLost),
                  this.disposables.add(() => this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost)),
                  this.wolCon.onChatMessage.subscribe(this.handleChatMessage),
                  this.disposables.add(() => this.wolCon.onChatMessage.unsubscribe(this.handleChatMessage)),
                  this.wolCon.onLeaveChannel.subscribe(this.handleLeaveChannel),
                  this.disposables.add(() => this.wolCon.onLeaveChannel.unsubscribe(this.handleLeaveChannel)),
                  this.wolCon.onGameStart.subscribe(this.handleGameStart),
                  this.disposables.add(() => this.wolCon.onGameStart.unsubscribe(this.handleGameStart)),
                  this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate),
                  this.disposables.add(() => this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate)),
                  this.disposables.add(() => this.resetPartyState()),
                  this.wolCon.partyStatus(),
                  this.wolCon.partyNoInvites(this.noInvites));
                let e = i.messages;
                ((this.chatUi = new d.ChatUi(
                  e,
                  (i) => {
                    this.form?.applyOptions((e) => {
                      var t = e["chatProps"];
                      e.chatProps = { ...t, ...i };
                    });
                  },
                  this.wolConfig,
                  this.wolCon,
                  this.wolService,
                  this.wladderService,
                  this.strings,
                  this.sound,
                )),
                  this.disposables.add(this.chatUi, () => (this.chatUi = void 0)),
                  this.refreshSidebarButtons(),
                  this.initView(),
                  this.updatePartyUI(),
                  this.requestPlayerProfileRefresh(),
                  this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], x.REQ_LIST_QUEUES),
                  (this.updateStatsIntervalId = setInterval(() => {
                    this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], x.REQ_LIST_QUEUES);
                  }, 3e4)));
                let t = new n.CancellationTokenSource();
                this.disposables.add(() => t.cancel());
                r = t.token;
                try {
                  await this.chatUi.loadChannel(r);
                } catch (t) {
                  let i = this.strings.get("WOL:MatchBadParameters");
                  if (t instanceof u.WolError) {
                    let e = new Map()
                      .set(u.WolError.Code.NoSuchChannel, "WOL:ChannelJoinFailure")
                      .set(u.WolError.Code.BadChannelPass, "TXT_BADPASS")
                      .set(u.WolError.Code.ChannelFull, "TXT_CHANNEL_FULL")
                      .set(u.WolError.Code.BannedFromChannel, "TXT_JOINBAN");
                    r = e.get(t.code);
                    r && (i = this.strings.get(r));
                  }
                  return void e.push({ text: i });
                }
              } else
                this.controller.goToScreen(T.ScreenType.Login, {
                  afterLogin: (e) => new w.MainMenuRoute(T.ScreenType.QuickGame, { messages: e }),
                });
            }
            resetPartyState() {
              ((this.partyState = this.getInitialPartyState()),
                (this.partySize = 1),
                (this.playButtonFlashing = !1),
                (this.prePartyQueueType = void 0));
            }
            isWaitingForTeammate() {
              return (
                !!this.partyState.partyId && 2 === this.partySize && !this.partyState.members.every((e) => e.ready)
              );
            }
            savePrePartyQueueType() {
              this.queueOpts.type !== C.LadderQueueType.Team2v2 && (this.prePartyQueueType = this.queueOpts.type);
            }
            restorePrePartyQueueType() {
              void 0 !== this.prePartyQueueType &&
                ((this.queueOpts.type = this.prePartyQueueType),
                this.form?.applyOptions((e) => (e.type = this.prePartyQueueType)),
                (this.prePartyQueueType = void 0));
            }
            getInitialPartyState() {
              return { partyId: void 0, members: [], status: E.PartyStatus.Idle };
            }
            requestPlayerProfileRefresh() {
              (this.refreshProfileTask?.cancel(),
                (this.refreshProfileTask = new i.Task((e) => this.refreshPlayerProfile(this.queueOpts.type, e))),
                this.refreshProfileTask.start().catch((e) => {
                  e instanceof n.OperationCanceledError || console.error(e);
                }));
            }
            refreshSidebarButtons() {
              (this.controller.setSidebarButtons(
                [
                  {
                    label: this.strings.get("GUI:QuickMatchPlay"),
                    tooltip: this.strings.get("GUI:FindAGame"),
                    disabled: this.queueState !== A.None,
                    flashing: this.playButtonFlashing,
                    onClick: () => {
                      this.availableQueueTypes.includes(this.queueOpts.type)
                        ? setTimeout(() => this.joinQueue(), 0)
                        : this.messageBoxApi.show(this.strings.get("WOL:MatchModeUnavail"), this.strings.get("GUI:OK"));
                    },
                  },
                  ...(this.partyState.partyId
                    ? [
                        {
                          label: this.strings.get("GUI:LeaveParty"),
                          tooltip: this.strings.get("GUI:LeaveParty"),
                          onClick: () => {
                            this.wolCon.partyLeave();
                          },
                        },
                      ]
                    : []),
                  ...(this.wladderService.getUrl()
                    ? [
                        {
                          label: this.strings.get("GUI:ViewLadder"),
                          tooltip: this.strings.get("GUI:ViewTourLadder"),
                          onClick: () => {
                            this.controller?.pushScreen(T.ScreenType.Ladder, {
                              ladderType: C.getLadderTypeForQueueType(this.queueOpts.type, this.partySize),
                              highlightPlayer: this.playerProfile,
                            });
                          },
                        },
                      ]
                    : []),
                  ...(this.controller?.hasScreen(T.ScreenType.LadderRules)
                    ? [
                        {
                          label: this.strings.get("GUI:ViewRules"),
                          onClick: () => {
                            this.controller?.pushScreen(T.ScreenType.LadderRules);
                          },
                        },
                      ]
                    : []),
                  ...(1 < this.serverRegions.getSize()
                    ? [
                        {
                          label: this.strings.get("GUI:ChangeServer"),
                          tooltip: this.strings.get("STT:ChangeServer"),
                          onClick: () => {
                            (this.wolService.closeWolConnection(),
                              this.controller?.goToScreen(T.ScreenType.Login, {
                                clearCredentials: !0,
                                afterLogin: (e) => new w.MainMenuRoute(T.ScreenType.QuickGame, { messages: e }),
                              }));
                          },
                        },
                      ]
                    : []),
                  {
                    label: this.queueState === A.None ? this.strings.get("GUI:Back") : this.strings.get("GUI:Cancel"),
                    isBottom: !0,
                    onClick: () => {
                      this.queueState === A.None
                        ? (this.wolService.closeWolConnection(), this.controller?.goToScreen(T.ScreenType.Home))
                        : this.leaveQueue();
                    },
                  },
                ],
                !0,
              ),
                this.controller.showSidebarButtons());
            }
            updateSidebarText(e) {
              this.controller.setSidebarMpContent({ text: e });
            }
            initView() {
              var [e] = this.jsxRenderer.render(
                a.jsx(o.HtmlView, {
                  width: "100%",
                  height: "100%",
                  component: s.QuickGameForm,
                  innerRef: (e) => (this.form = e),
                  props: {
                    strings: this.strings,
                    disabled: this.queueState !== A.None,
                    countryUiNames: new Map(
                      [[l.RANDOM_COUNTRY_NAME, l.RANDOM_COUNTRY_UI_NAME]].concat(
                        this.getAvailablePlayerCountryRules().map((e) => [e.name, e.uiName]),
                      ),
                    ),
                    countryUiTooltips: new Map(
                      [[l.RANDOM_COUNTRY_NAME, l.RANDOM_COUNTRY_UI_TOOLTIP]].concat(
                        this.getAvailablePlayerCountryRules()
                          .filter((e) => e.uiTooltip)
                          .map((e) => [e.name, e.uiTooltip]),
                      ),
                    ),
                    availableTypes: Object.values(C.LadderQueueType),
                    enabledTypes: this.availableQueueTypes,
                    availableColors: [l.RANDOM_COLOR_NAME].concat(this.getAvailablePlayerColors()),
                    availableCountries: [l.RANDOM_COUNTRY_NAME].concat(this.getAvailablePlayerCountries()),
                    color: this.getColorNameById(this.queueOpts.colorId),
                    country: this.getCountryNameById(this.queueOpts.countryId),
                    type: this.queueOpts.type,
                    ranked: this.queueOpts.ranked,
                    unrankedEnabled: this.unrankedEnabled,
                    playerName: this.wolCon.getCurrentUser() ?? "",
                    playerProfile: this.playerProfile,
                    chatProps: this.chatUi.getViewProps(),
                    partyState: this.partyState.partyId ? this.partyState : void 0,
                    partySize: this.partySize,
                    noInvites: this.noInvites,
                    onNoInvitesChange: (t) => {
                      ((this.noInvites = t),
                        this.form?.applyOptions((e) => (e.noInvites = t)),
                        this.localPrefs.setItem(c.StorageKey.PartyNoInvites, t ? "1" : "0"),
                        this.wolCon.partyNoInvites(t));
                    },
                    onCountrySelect: (t) => {
                      var e = this.getCountryIdByName(t);
                      ((this.queueOpts.countryId = e),
                        this.form?.applyOptions((e) => {
                          e.country = t;
                        }),
                        e !== l.RANDOM_COUNTRY_ID
                          ? this.localPrefs.setItem(c.StorageKey.LastPlayerCountry, String(e))
                          : this.localPrefs.removeItem(c.StorageKey.LastPlayerCountry));
                    },
                    onColorSelect: (t) => {
                      var e = this.getColorIdByName(t);
                      ((this.queueOpts.colorId = e),
                        this.form?.applyOptions((e) => {
                          e.color = t;
                        }),
                        e !== l.RANDOM_COLOR_ID
                          ? this.localPrefs.setItem(c.StorageKey.LastPlayerColor, String(e))
                          : this.localPrefs.removeItem(c.StorageKey.LastPlayerColor));
                    },
                    onRankedChange: (t) => {
                      ((this.queueOpts.ranked = t),
                        this.form?.applyOptions((e) => (e.ranked = t)),
                        this.localPrefs.setItem(c.StorageKey.LastQueueRanked, String(Number(t))));
                    },
                    onTypeChange: (t) => {
                      this.partySize > C.teamSizes.get(t) ||
                        (this.queueOpts.type !== t &&
                          ((this.queueOpts.type = t),
                          (this.playerProfile = void 0),
                          this.form?.applyOptions((e) => {
                            ((e.type = t), (e.playerProfile = void 0));
                          }),
                          this.localPrefs.setItem(c.StorageKey.LastQueueType, t),
                          this.form && this.requestPlayerProfileRefresh()));
                    },
                  },
                }),
              );
              this.controller.setMainComponent(e);
            }
            async refreshPlayerProfile(e, t) {
              var i, r;
              !this.wladderService.getUrl() ||
                ((i = this.wolCon.getCurrentUser()) &&
                  ((r = C.getLadderTypeForQueueType(e, this.partySize)),
                  ([r] = await this.wladderService.listSearch(
                    [i],
                    t,
                    r,
                    h.WLadderService.CURRENT_SEASON,
                    this.clientLocale,
                  )),
                  r &&
                    !t.isCancelled() &&
                    ((this.playerProfile = r),
                    this.form?.applyOptions((e) => (e.playerProfile = this.playerProfile)))));
            }
            getAvailablePlayerCountryRules() {
              return this.rules.getMultiplayerCountries();
            }
            getAvailablePlayerCountries() {
              return this.getAvailablePlayerCountryRules().map((e) => e.name);
            }
            getCountryNameById(e) {
              let t;
              return (
                (t = e === l.RANDOM_COUNTRY_ID ? l.RANDOM_COUNTRY_NAME : this.getAvailablePlayerCountries()[e]),
                t
              );
            }
            getCountryIdByName(t) {
              let i;
              if (t === l.RANDOM_COUNTRY_NAME) i = l.RANDOM_COUNTRY_ID;
              else {
                let e = this.getAvailablePlayerCountries();
                i = e.indexOf(t);
              }
              return i;
            }
            getAvailablePlayerColors() {
              return [...this.rules.getMultiplayerColors().values()].map((e) => e.asHexString());
            }
            getColorNameById(e) {
              let t;
              return ((t = e === l.RANDOM_COLOR_ID ? l.RANDOM_COLOR_NAME : this.getAvailablePlayerColors()[e]), t);
            }
            getColorIdByName(t) {
              let i;
              if (t === l.RANDOM_COLOR_NAME) i = l.RANDOM_COLOR_ID;
              else {
                let e = this.getAvailablePlayerColors();
                if (((i = e.indexOf(t)), -1 === i)) throw new Error(`Color ${t} not found in available player colors`);
              }
              return i;
            }
            async joinQueue() {
              if (this.queueState === A.None) {
                ((this.quickMatchChannelName = void 0),
                  this.updateSidebarText(this.strings.get("WOL:RequestingMatch") + "..."),
                  this.updateQueueState(A.Initializing));
                try {
                  var i = `#Lob ${this.wolConfig.getQuickMatchChannelId(this.queueOpts.type)} 0`;
                  if (
                    (await this.wolCon.joinChannel(i, this.wolConfig.getGlobalChannelPass()),
                    this.queueState !== A.Initializing)
                  )
                    return;
                  this.quickMatchChannelName = i;
                  let { countryId: e, colorId: t } = this.queueOpts;
                  var r =
                    x.REQ_MATCH +
                    " " +
                    [
                      [x.TAG_COUNTRY, e],
                      [x.TAG_COLOR, t],
                      [x.TAG_VERSION, this.engineVersion],
                      [x.TAG_MODHASH, this.engineModHash],
                      [x.TAG_RANKED, Number(this.queueOpts.ranked)],
                    ]
                      .map((e) => e.join("="))
                      .join(", ");
                  this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], r);
                } catch (e) {
                  return void (e instanceof u.WolError && e.code === u.WolError.Code.BadChannelPass
                    ? this.handleError(e, this.strings.get("WOL:MatchModeUnavail"), { fatal: !1 })
                    : this.handleError(e, this.strings.get("WOL:MatchBadParameters"), { fatal: !0 }));
                }
              }
            }
            leaveQueue() {
              this.queueState !== A.None &&
                (this.updateQueueState(A.None),
                this.wolCon.isOpen() &&
                  this.quickMatchChannelName &&
                  (this.wolCon.leaveChannel(this.quickMatchChannelName), (this.quickMatchChannelName = void 0)));
            }
            updateQueueState(t) {
              if (
                ((this.queueState = t),
                this.gameStartTimeoutId && (clearTimeout(this.gameStartTimeoutId), (this.gameStartTimeoutId = void 0)),
                this.countdownIntervalId &&
                  (clearInterval(this.countdownIntervalId), (this.countdownIntervalId = void 0)),
                this.updateStatsIntervalId &&
                  (clearInterval(this.updateStatsIntervalId), (this.updateStatsIntervalId = void 0)),
                this.form && (this.form.applyOptions((e) => (e.disabled = t !== A.None)), this.refreshSidebarButtons()),
                t !== A.None)
              ) {
                (t === A.WaitingForGameStart &&
                  (this.gameStartTimeoutId = setTimeout(async () => {
                    (console.log("Timed out. Rejoining queue..."),
                      this.leaveQueue(),
                      this.wolCon.isOpen() && this.joinQueue());
                  }, 1e4)),
                  t === A.WaitingForStartTimer &&
                    (this.countdownIntervalId = setInterval(() => this.tickStartTimer(), 1e3)),
                  t === A.WaitingForMatch &&
                    (this.updateStatsIntervalId = setInterval(() => this.requestStats(), 5e3)));
                let e;
                switch (t) {
                  case A.WaitingForMatch:
                    e = this.isWaitingForTeammate()
                      ? this.strings.get("GUI:WaitingForTeammate")
                      : this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type);
                    break;
                  case A.WaitingForStartTimer:
                    e = this.strings.get("WOL:MatchStartSeconds", this.countdownSeconds);
                    break;
                  case A.WaitingForGameStart:
                    e = this.strings.get("WOL:MatchGameStarting");
                }
                void 0 !== e && (this.updateSidebarText(e), console.log(e));
              } else this.updateSidebarText("");
            }
            async tickStartTimer() {
              if (void 0 === this.countdownSeconds) throw new Error("Game start countdown should be set by now");
              0 < this.countdownSeconds
                ? (this.countdownSeconds--,
                  this.updateSidebarText(this.strings.get("WOL:MatchStartSeconds", this.countdownSeconds)),
                  this.sound.play(b.SoundKey.QuickMatchTimer, S.ChannelType.Ui))
                : this.updateQueueState(A.WaitingForGameStart);
            }
            requestStats() {
              this.queueState === A.WaitingForMatch &&
                this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], x.REQ_STATS);
            }
            async onUnstack() {
              (this.refreshSidebarButtons(),
                this.initView(),
                this.wolService.isConnected() && this.wolCon.getCurrentUser()
                  ? this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], x.REQ_LIST_QUEUES)
                  : this.controller.goToScreen(T.ScreenType.Login, {
                      afterLogin: (e) => new w.MainMenuRoute(T.ScreenType.QuickGame, { messages: e }),
                    }),
                this.requestPlayerProfileRefresh(),
                this.updatePartyUI());
            }
            async onStack() {
              await this.unrender();
            }
            async onLeave() {
              (this.updateQueueState(A.None),
                this.refreshProfileTask && (this.refreshProfileTask.cancel(), (this.refreshProfileTask = void 0)),
                this.disposables.dispose(),
                this.wolCon.isOpen() &&
                  this.quickMatchChannelName &&
                  this.wolCon.leaveChannel(this.quickMatchChannelName),
                await this.unrender());
            }
            async unrender() {
              (this.availQueueRefreshIntervalId &&
                (clearInterval(this.availQueueRefreshIntervalId), (this.availQueueRefreshIntervalId = void 0)),
                (this.form = void 0),
                await this.controller.hideSidebarButtons());
            }
            showInviteDialog(t) {
              (this.pendingInvite && clearTimeout(this.pendingInvite.timeoutId), this.destroyInviteDialog());
              var e = this.userHasDeclinedInvitesFrom.has(t);
              const i = () => {
                this.pendingInvite && (clearTimeout(this.pendingInvite.timeoutId), (this.pendingInvite = void 0));
              };
              var r = setTimeout(() => {
                ((this.pendingInvite = void 0), this.destroyInviteDialog());
              }, 3e4);
              ((this.pendingInvite = { from: t, timeoutId: r }),
                this.sound.play(b.SoundKey.PartyInvite, S.ChannelType.Ui));
              let [s] = this.jsxRenderer.render(
                a.jsx(o.HtmlView, {
                  component: g.PartyInviteDialog,
                  props: {
                    inviterName: t,
                    strings: this.strings,
                    showPreventionCheckbox: e,
                    viewport: this.uiScene.viewport,
                    onAccept: () => {
                      (i(),
                        this.destroyInviteDialog(),
                        this.leaveQueue(),
                        this.userHasDeclinedInvitesFrom.delete(t),
                        this.wolCon.partyAccept(t));
                    },
                    onDecline: (e) => {
                      (i(),
                        this.destroyInviteDialog(),
                        this.wolCon.partyDecline(t),
                        this.userHasDeclinedInvitesFrom.add(t),
                        e && this.wolCon.partyPrevent(t, !0));
                    },
                  },
                }),
              );
              ((this.inviteDialog = s),
                this.uiScene.add(s),
                this.disposables.add(
                  s,
                  () => this.uiScene.remove(s),
                  () => (this.inviteDialog = void 0),
                ));
            }
            destroyInviteDialog() {
              this.inviteDialog && (this.inviteDialog.destroy(), (this.inviteDialog = void 0));
            }
            updatePartyUI() {
              (this.form &&
                this.form.applyOptions((e) => {
                  ((e.partyState = this.partyState), (e.partySize = this.partySize), (e.type = this.queueOpts.type));
                }),
                this.refreshSidebarButtons());
            }
            handleError(e, t, { fatal: i }) {
              (this.updateQueueState(A.None),
                this.errorHandler.handle(e, t, () => {
                  i && (this.wolService.closeWolConnection(), this.controller?.goToScreen(T.ScreenType.Home));
                }));
            }
          }),
          t("QuickGameScreen", p));
      },
    };
  },
);
