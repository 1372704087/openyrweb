// === Reconstructed SystemJS module: gui/screen/mainMenu/quickGame/ChatUi ===
// deps: ["@puzzl/core/lib/async/cancellation","network/ladder/wladderConfig","util/disposable/CompositeDisposable","network/chat/ChatMessage","engine/sound/SoundKey","engine/sound/ChannelType","@puzzl/core/lib/async/Task","gui/chat/ChatHistory","util/time","gui/component/ChatInput"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/quickGame/ChatUi",
  [
    "@puzzl/core/lib/async/cancellation",
    "network/ladder/wladderConfig",
    "util/disposable/CompositeDisposable",
    "network/chat/ChatMessage",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "@puzzl/core/lib/async/Task",
    "gui/chat/ChatHistory",
    "util/time",
    "gui/component/ChatInput",
  ],
  function (e, t) {
    "use strict";
    var i, s, l, c, h, u, r, d, a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        (e(
          "ChatUi",
          (o = class {
            constructor(e, t, i, r, s, a, n, o) {
              ((this.messages = e),
                (this.updateView = t),
                (this.wolConfig = i),
                (this.wolCon = r),
                (this.wolService = s),
                (this.wladderService = a),
                (this.strings = n),
                (this.sound = o),
                (this.disposables = new l.CompositeDisposable()),
                (this.users = []),
                (this.chatHistory = new d.ChatHistory()),
                (this.playerProfiles = new Map()),
                (this.onChannelJoinLeave = (t) => {
                  let e = t.channel,
                    i = e.match(/#Lob (\d+) (\d)/i);
                  if (i) {
                    var [, r, s] = i.map(Number);
                    if (this.wolConfig.getAllQuickMatchChannelIds().includes(r)) return;
                    e = this.strings.get("TXT_LOB_" + (s + 1));
                  }
                  t.user.name === this.wolCon.getCurrentUser()
                    ? this.addSystemMessage(this.strings.get("join" === t.type ? "TXT_JOINED_S" : "TXT_YOULEFT", e))
                    : t.channel === this.channelName &&
                      ("join" === t.type
                        ? (this.users.push(t.user), this.users.sort((e, t) => Number(t.operator) - Number(e.operator)))
                        : -1 !== (s = this.users.findIndex((e) => e.name === t.user.name)) && this.users.splice(s, 1),
                      this.updateView(),
                      this.refreshPlayerRanks());
                }),
                (this.onChannelUsers = (e) => {
                  e.channelName === this.channelName &&
                    ((this.users = e.users), this.updateView({ users: this.users }), this.refreshPlayerRanks());
                }),
                (this.onChannelMessage = (t) => {
                  var e;
                  [t.from, t.to.name].includes(this.wolConfig.getQuickMatchBotName()) ||
                    ((t.to.type !== c.ChatRecipientType.Page && t.to.type !== c.ChatRecipientType.Whisper) ||
                      this.sound.play(h.SoundKey.IncomingMessage, u.ChannelType.Ui),
                    (e = { ...t, operator: this.users.find((e) => e.name === t.from)?.operator }),
                    this.messages.push(e),
                    this.updateView(),
                    t.to.type === c.ChatRecipientType.Whisper &&
                      t.to.name !== this.wolCon.getServerName() &&
                      t.from !== this.wolCon.getCurrentUser() &&
                      (this.chatHistory.lastWhisperFrom.value = t.from));
                }));
            }
            async loadChannel(e) {
              ((this.channelName = void 0),
                (this.users = []),
                this.wolCon.onJoinChannel.subscribe(this.onChannelJoinLeave),
                this.wolCon.onLeaveChannel.subscribe(this.onChannelJoinLeave),
                this.wolCon.onChannelUsers.subscribe(this.onChannelUsers),
                this.wolCon.onChatMessage.subscribe(this.onChannelMessage));
              let t = this.wolService.getConfig();
              var i = `#Lob ${t.getClientChannelType()} 0`;
              (await this.wolCon.joinChannel(i, t.getGlobalChannelPass()),
                e.isCancelled()
                  ? this.wolCon.isOpen() && this.wolCon.leaveChannel(i)
                  : ((this.channelName = i),
                    this.playerProfiles.clear(),
                    this.updateView({ channels: [i], users: this.users })));
            }
            getViewProps() {
              return {
                strings: this.strings,
                messages: this.messages,
                chatHistory: this.chatHistory,
                channels: this.channelName ? [this.channelName] : [],
                localUsername: this.wolCon.getCurrentUser(),
                users: this.users,
                playerProfiles: this.playerProfiles,
                onSendMessage: (e) => {
                  e.value.length
                    ? e.recipient.type !== c.ChatRecipientType.Channel || e.recipient.name !== n.IMPLICIT_CHANNEL_NAME
                      ? this.wolCon.isOpen() &&
                        (this.wolCon.sendChatMessage(e.value, e.recipient),
                        e.recipient.type === c.ChatRecipientType.Whisper &&
                          (this.chatHistory.lastWhisperTo.value = e.recipient.name))
                      : this.addSystemMessage(this.strings.get("TXT_NOT_IN_CHAN"))
                    : this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
                },
                onInviteToTeam: (e) => {
                  this.wolCon.partyInvite(e.name);
                },
              };
            }
            addSystemMessage(e) {
              (this.messages.push({ text: e }), this.updateView());
            }
            refreshPlayerRanks() {
              if (this.wladderService.getUrl()) {
                this.ranksUpdateTask?.cancel();
                let e = (this.ranksUpdateTask = new r.Task(async (e) => {
                  let t = this.users.map((e) => e.name).filter((e) => !this.playerProfiles.has(e));
                  if (t.length) {
                    for (; 0 < t.length;) {
                      var i,
                        r = t.splice(0, s.MAX_LIST_SEARCH_COUNT),
                        r = await this.wladderService.listSearch(r, e);
                      if (e.isCancelled()) return;
                      for (i of r) this.playerProfiles.set(i.name, i);
                    }
                    this.updateView();
                  }
                }));
                e.start().catch((e) => {
                  e instanceof i.OperationCanceledError || console.error(e);
                });
              }
            }
            dispose() {
              (this.disposables.dispose(),
                this.ranksUpdateTask && (this.ranksUpdateTask.cancel(), (this.ranksUpdateTask = void 0)),
                this.wolCon.isOpen() && this.channelName && this.wolCon.leaveChannel(this.channelName),
                this.wolCon.onJoinChannel.unsubscribe(this.onChannelJoinLeave),
                this.wolCon.onLeaveChannel.unsubscribe(this.onChannelJoinLeave),
                this.wolCon.onChannelUsers.unsubscribe(this.onChannelUsers),
                this.wolCon.onChatMessage.unsubscribe(this.onChannelMessage),
                (this.channelName = void 0),
                (this.messages = []),
                (this.users = []),
                this.playerProfiles.clear());
            }
          }),
        ),
          __decorate([a.Throttle(5e3)], o.prototype, "refreshPlayerRanks", null));
      },
    };
  },
);
