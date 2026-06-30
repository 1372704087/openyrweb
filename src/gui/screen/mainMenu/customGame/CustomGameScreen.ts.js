// === Reconstructed SystemJS module: gui/screen/mainMenu/customGame/CustomGameScreen ===
// deps: ["gui/screen/mainMenu/customGame/component/GameBrowser","gui/screen/mainMenu/ScreenType","util/disposable/CompositeDisposable","gui/jsx/jsx","gui/jsx/HtmlView","engine/sound/SoundKey","engine/sound/ChannelType","engine/sound/Music","network/IrcConnection","gui/screen/mainMenu/MainMenuScreen","@puzzl/core/lib/async/Task","@puzzl/core/lib/async/cancellation/OperationCanceledError","network/ladder/wladderConfig","gui/screen/mainMenu/MainMenuRoute","network/chat/ChatMessage","gui/chat/ChatHistory","network/WolError","@puzzl/core/lib/async/cancellation","network/partyCodes"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/customGame/CustomGameScreen",
  [
    "gui/screen/mainMenu/customGame/component/GameBrowser",
    "gui/screen/mainMenu/ScreenType",
    "util/disposable/CompositeDisposable",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "engine/sound/Music",
    "network/IrcConnection",
    "gui/screen/mainMenu/MainMenuScreen",
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/cancellation/OperationCanceledError",
    "network/ladder/wladderConfig",
    "gui/screen/mainMenu/MainMenuRoute",
    "network/chat/ChatMessage",
    "gui/chat/ChatHistory",
    "network/WolError",
    "@puzzl/core/lib/async/cancellation",
    "network/partyCodes",
  ],
  function (e, t) {
    "use strict";
    var i, r, h, s, a, u, d, g, n, o, l, c, p, m, f, y, T, v, b, S;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          s = e;
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
          n = e;
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
        ((S = class extends o.MainMenuScreen {
          constructor(e, t, i, r, s, a, n, o, l, c) {
            (super(),
              (this.engineModHash = e),
              (this.strings = t),
              (this.wolCon = i),
              (this.wolService = r),
              (this.wladderService = s),
              (this.jsxRenderer = a),
              (this.sound = n),
              (this.serverRegions = o),
              (this.mapList = l),
              (this.errorHandler = c),
              (this.title = this.strings.get("GUI:CustomMatch")),
              (this.musicType = g.MusicType.NormalShuffle),
              (this.playerProfiles = new Map()),
              (this.disposables = new h.CompositeDisposable()),
              (this.handlePartyUpdate = (e) => {
                var t = e.split(" ");
                t[0] !== b.RPL_PARTY_INVITE || ((t = t[1]) && this.wolCon.partyInviteUnavailable(t));
              }),
              (this.onChannelJoinLeave = (t) => {
                let e = t.channel,
                  i = e.match(/#Lob \d+ (\d)/i);
                var r;
                (i && (([, r] = i.map(Number)), (e = this.strings.get("TXT_LOB_" + (r + 1)))),
                  t.user.name === this.wolCon.getCurrentUser()
                    ? this.addSystemMessage(this.strings.get("join" === t.type ? "TXT_JOINED_S" : "TXT_YOULEFT", e))
                    : t.channel === this.channelName &&
                      ("join" === t.type
                        ? (this.users.push(t.user), this.users.sort((e, t) => Number(t.operator) - Number(e.operator)))
                        : -1 !== (r = this.users.findIndex((e) => e.name === t.user.name)) && this.users.splice(r, 1),
                      this.gameBrowser?.refresh()));
              }),
              (this.onChannelUsers = (e) => {
                e.channelName === this.channelName &&
                  ((this.users = e.users), this.gameBrowser?.applyOptions((e) => (e.users = this.users)));
              }),
              (this.onChannelMessage = (t) => {
                (t.to.type !== f.ChatRecipientType.Page && t.to.type !== f.ChatRecipientType.Whisper) ||
                  this.sound.play(u.SoundKey.IncomingMessage, d.ChannelType.Ui);
                var e = { ...t, operator: this.users.find((e) => e.name === t.from)?.operator };
                (this.messages.push(e),
                  this.gameBrowser?.refresh(),
                  t.to.type === f.ChatRecipientType.Whisper &&
                    t.to.name !== this.wolCon.getServerName() &&
                    t.from !== this.wolCon.getCurrentUser() &&
                    (this.chatHistory.lastWhisperFrom.value = t.from));
              }),
              (this.onWolClose = () => {
                clearInterval(this.refreshTimeoutId);
              }),
              (this.onWolConLost = (e) => {
                this.handleError(e, this.strings.get("TXT_YOURE_DISCON"));
              }));
          }
          addSystemMessage(e) {
            (this.messages.push({ text: e }), this.gameBrowser?.refresh());
          }
          async refreshGames(e) {
            if (this.wolCon.isOpen()) {
              if (this.channelName && this.wolCon.getCurrentUser()) {
                let t;
                try {
                  var i = this.wolService.getConfig().getClientChannelType();
                  if (((t = await this.wolCon.listGames(i, i)), e?.isCancelled())) return;
                } catch (e) {
                  if (e instanceof n.IrcConnection.SocketError) return;
                  if (e instanceof n.IrcConnection.NoReplyError) return;
                  throw e;
                }
                (t.sort((e, t) => Number(e.passLocked) - Number(t.passLocked)), (this.games = t));
                const r = this.selectedGame;
                (r && this.onGameSelectionChange(t.find((e) => e.name === r.name)),
                  this.gameBrowser?.applyOptions((e) => (e.games = t)),
                  this.refreshPlayerRanks());
              }
            } else this.onWolClose();
          }
          refreshPlayerRanks() {
            if (this.wladderService.getUrl()) {
              this.ranksUpdateTask?.cancel();
              let e = (this.ranksUpdateTask = new l.Task(async (e) => {
                let t = [...new Set([...this.users.map((e) => e.name), ...this.games.map((e) => e.hostName)])].filter(
                  (e) => !this.playerProfiles.has(e),
                );
                if (t.length) {
                  for (; 0 < t.length;) {
                    var i,
                      r = t.splice(0, p.MAX_LIST_SEARCH_COUNT),
                      r = await this.wladderService.listSearch(r, e);
                    if (e.isCancelled()) return;
                    for (i of r) this.playerProfiles.set(i.name, i);
                  }
                  this.gameBrowser?.refresh();
                }
              }));
              e.start().catch((e) => {
                e instanceof c.OperationCanceledError || console.error(e);
              });
            }
          }
          onGameSelectionChange(e) {
            ((this.selectedGame = e), this.refreshSidebarButtons());
          }
          gameIsFull(e) {
            return e.humanPlayers + e.aiPlayers === e.maxPlayers - (e.observable ? 1 : 0);
          }
          refreshSidebarButtons() {
            let e = this.selectedGame;
            var t = [
              {
                label: this.strings.get("GUI:CreateGame"),
                tooltip: this.strings.get("STT:LobbyButtonNew"),
                onClick: () => this.createGame(),
              },
              {
                label: this.strings.get("GUI:JoinGame"),
                tooltip: this.strings.get("STT:LobbyButtonJoin"),
                disabled: !e || this.gameIsFull(e),
                onClick: () => this.joinGame(e),
              },
              {
                label: this.strings.get("GUI:Observe"),
                tooltip: this.strings.get("STT:LobbyButtonObserve"),
                disabled: !e || !e.observable || !!e.observers,
                onClick: () => {
                  this.observeGame(e);
                },
              },
              ...(1 < this.serverRegions.getSize()
                ? [
                    {
                      label: this.strings.get("GUI:ChangeServer"),
                      tooltip: this.strings.get("STT:ChangeServer"),
                      onClick: () => {
                        (this.wolService.closeWolConnection(),
                          this.controller?.goToScreen(r.ScreenType.Login, {
                            clearCredentials: !0,
                            afterLogin: (e) => new m.MainMenuRoute(r.ScreenType.CustomGame, { messages: e }),
                          }));
                      },
                    },
                  ]
                : []),
              {
                label: this.strings.get("GUI:Back"),
                tooltip: this.strings.get("STT:LobbyButtonBack"),
                isBottom: !0,
                onClick: () => {
                  (this.wolService.closeWolConnection(), this.controller?.goToScreen(r.ScreenType.Home));
                },
              },
            ];
            this.controller.setSidebarButtons(t);
          }
          initView(e) {
            var [t] = this.jsxRenderer.render(
              s.jsx(a.HtmlView, {
                innerRef: (e) => (this.gameBrowser = e),
                component: i.GameBrowser,
                props: {
                  strings: this.strings,
                  messages: this.messages,
                  chatHistory: this.chatHistory,
                  channels: [this.channelName],
                  localUsername: this.wolCon.getCurrentUser(),
                  users: this.users,
                  games: this.games,
                  playerProfiles: this.playerProfiles,
                  mapList: this.mapList,
                  onSendMessage: (e) => {
                    e.value.length
                      ? this.wolCon.isOpen() &&
                        (this.wolCon.sendChatMessage(e.value, e.recipient),
                        e.recipient.type === f.ChatRecipientType.Whisper &&
                          (this.chatHistory.lastWhisperTo.value = e.recipient.name))
                      : this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
                  },
                  onRefreshClick: () => this.refreshGames(e),
                  onSelectGame: (e) => this.onGameSelectionChange(e),
                  onDoubleClickGame: (e) => {
                    this.gameIsFull(e) || this.joinGame(e);
                  },
                },
              }),
            );
            (this.controller.setMainComponent(t), this.refreshSidebarButtons(), this.controller.showSidebarButtons());
          }
          async onEnter(e) {
            ((this.messages = e?.messages ?? []),
              (this.chatHistory = new y.ChatHistory()),
              this.controller.toggleMainVideo(!1));
            let t = new v.CancellationTokenSource();
            this.disposables.add(() => t.cancel());
            var i = t.token;
            this.wolCon.getCurrentUser()
              ? await this.loadChannel(i)
              : this.controller.goToScreen(r.ScreenType.Login, {
                  afterLogin: (e) => new m.MainMenuRoute(r.ScreenType.CustomGame, { messages: e }),
                });
          }
          async loadChannel(t) {
            ((this.channelName = void 0),
              (this.users = []),
              (this.games = []),
              (this.selectedGame = void 0),
              this.wolCon.onJoinChannel.subscribe(this.onChannelJoinLeave),
              this.wolCon.onLeaveChannel.subscribe(this.onChannelJoinLeave),
              this.wolCon.onChannelUsers.subscribe(this.onChannelUsers),
              this.wolCon.onChatMessage.subscribe(this.onChannelMessage),
              this.wolCon.onClose.subscribe(this.onWolClose),
              this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate),
              this.wolService.onWolConnectionLost.subscribe(this.onWolConLost));
            try {
              let e = this.wolService.getConfig();
              var r = `#Lob ${e.getClientChannelType()} 0`;
              if ((await this.wolCon.joinChannel(r, e.getGlobalChannelPass()), t.isCancelled())) return;
              ((this.channelName = r),
                this.playerProfiles.clear(),
                this.initView(t),
                this.gameBrowser?.applyOptions((e) => (e.users = this.users)),
                this.refreshGames(t),
                (this.refreshTimeoutId = setInterval(() => this.refreshGames(t), 5e3)));
            } catch (t) {
              let i = this.strings.get("WOL:MatchBadParameters");
              if (t instanceof T.WolError) {
                let e = new Map()
                  .set(T.WolError.Code.NoSuchChannel, "WOL:ChannelJoinFailure")
                  .set(T.WolError.Code.BadChannelPass, "TXT_BADPASS")
                  .set(T.WolError.Code.ChannelFull, "TXT_CHANNEL_FULL")
                  .set(T.WolError.Code.BannedFromChannel, "TXT_JOINBAN");
                r = e.get(t.code);
                r && (i = this.strings.get(r));
              }
              return void this.handleError(t, i);
            }
          }
          async onLeave() {
            (this.disposables.dispose(),
              this.refreshTimeoutId && clearInterval(this.refreshTimeoutId),
              this.ranksUpdateTask && (this.ranksUpdateTask.cancel(), (this.ranksUpdateTask = void 0)),
              this.wolCon.isOpen() && this.channelName && this.wolCon.leaveChannel(this.channelName),
              this.wolCon.onJoinChannel.unsubscribe(this.onChannelJoinLeave),
              this.wolCon.onLeaveChannel.unsubscribe(this.onChannelJoinLeave),
              this.wolCon.onChannelUsers.unsubscribe(this.onChannelUsers),
              this.wolCon.onChatMessage.unsubscribe(this.onChannelMessage),
              this.wolCon.onClose.unsubscribe(this.onWolClose),
              this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate),
              this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost),
              await this.controller.hideSidebarButtons(),
              (this.channelName = void 0),
              (this.gameBrowser = void 0),
              (this.messages = []),
              (this.users = []),
              this.playerProfiles.clear(),
              (this.games = []),
              (this.selectedGame = void 0));
          }
          async createGame() {
            this.controller.goToScreen(r.ScreenType.Lobby, { create: !0 });
          }
          async joinGame(e) {
            this.joinRoom(e, !1);
          }
          observeGame(e) {
            this.joinRoom(e, !0);
          }
          joinRoom(e, t) {
            e.modHash === this.engineModHash
              ? this.controller.goToScreen(r.ScreenType.Lobby, { game: e, observe: t })
              : void 0 !== e.modHash && this.addSystemMessage(this.strings.get("TXT_MISMATCH"));
          }
          handleError(e, t) {
            (this.errorHandler.handle(e, t, () => {
              (this.wolService.closeWolConnection(), this.controller?.goToScreen(r.ScreenType.Home));
            }),
              clearInterval(this.refreshTimeoutId));
          }
        }),
          e("CustomGameScreen", S));
      },
    };
  },
);
