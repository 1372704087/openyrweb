// === Reconstructed SystemJS module: gui/screen/game/ChatNetHandler ===
// deps: ["util/disposable/CompositeDisposable","network/chat/ChatMessage","network/gservConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/ChatNetHandler",
  ["util/disposable/CompositeDisposable", "network/chat/ChatMessage", "network/gservConfig"],
  function (e, t) {
    "use strict";
    var c, h, u, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        e(
          "ChatNetHandler",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l) {
              ((this.gservCon = e),
                (this.wolCon = t),
                (this.messageList = i),
                (this.chatHistory = r),
                (this.chatMessageFormat = s),
                (this.localPlayer = a),
                (this.game = n),
                (this.replayRecorder = o),
                (this.mutedPlayers = l),
                (this.disposables = new c.CompositeDisposable()),
                (this.handleMessage = (i) => {
                  if (i.from === this.localPlayer.name && i.to.type === h.ChatRecipientType.Whisper)
                    return (
                      this.messageList.addChatMessage(
                        this.chatMessageFormat.formatPrefixPlain(i) + " " + i.text,
                        "mediumpurple",
                      ),
                      void this.chatHistory.addChatMessage(i)
                    );
                  var e = this.chatMessageFormat.formatPrefixPlain(i);
                  let r;
                  if (
                    i.to.type !== h.ChatRecipientType.Page ||
                    (i.from !== this.gservCon.getServerName() && i.from !== this.wolCon.getServerName())
                  ) {
                    let t;
                    if (i.to.type === h.ChatRecipientType.Whisper) ((t = i.from), (r = "mediumpurple"));
                    else {
                      if (
                        i.to.type !== h.ChatRecipientType.Channel ||
                        ![u.RECIPIENT_ALL, u.RECIPIENT_TEAM].includes(i.to.name)
                      )
                        return;
                      {
                        let e = this.game.getPlayerByName(i.from);
                        ((t = e.name), (r = e.color.asHexString()));
                      }
                    }
                    if (this.mutedPlayers.has(t)) return;
                  } else r = "yellow";
                  (i.to.type === h.ChatRecipientType.Channel &&
                    i.to.name === u.RECIPIENT_ALL &&
                    this.replayRecorder.recordChatMessage(this.game.currentTick, i.from, i.text),
                    this.messageList.addChatMessage(e + " " + i.text, r),
                    this.chatHistory.addChatMessage(i),
                    i.to.type === h.ChatRecipientType.Whisper &&
                      i.to.name !== this.wolCon.getServerName() &&
                      i.to.name !== this.gservCon.getServerName() &&
                      (this.chatHistory.lastWhisperFrom.value = i.from));
                }));
            }
            init() {
              (this.wolCon.onChatMessage.subscribe(this.handleMessage),
                this.disposables.add(() => this.wolCon.onChatMessage.unsubscribe(this.handleMessage)),
                this.gservCon.onChatMessage.subscribe(this.handleMessage),
                this.disposables.add(() => this.gservCon.onChatMessage.unsubscribe(this.handleMessage)));
            }
            submitMessage(e, t) {
              var i;
              this.gservCon.isOpen()
                ? t.type === h.ChatRecipientType.Channel && t.name === u.RECIPIENT_ALL
                  ? e.startsWith("/")
                    ? ((i = this.wolCon.getCurrentUser()), this.wolCon.isOpen() && i && this.wolCon.privmsg([i], e))
                    : this.gservCon.sayChannel(e)
                  : t.type === h.ChatRecipientType.Channel && t.name === u.RECIPIENT_TEAM
                    ? ((i = this.game.alliances
                        .getAllies(this.localPlayer)
                        .filter((e) => !e.isAi)
                        .map((e) => e.name)),
                      this.gservCon.privmsg([...i, this.localPlayer.name], e))
                    : t.type === h.ChatRecipientType.Whisper &&
                      this.wolCon.isOpen() &&
                      (this.wolCon.privmsg([t.name], e), (this.chatHistory.lastWhisperTo.value = t.name))
                : console.warn("Can't send chat message. Network connection is already closed.");
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
