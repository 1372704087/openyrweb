// === Reconstructed SystemJS module: network/WolConnection ===
// deps: ["util/event","network/IrcConnection","network/WolError","util/string","util/Base64","util/typeGuard","network/gameopt/FileNameEncoder","network/chat/ChatMessage","network/wolCodes","network/IrcProtocol","network/WolLocale","network/WolConfig","network/gameopt/Parser","@puzzl/core/lib/regexp","network/WolGameReport"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/WolConnection",
  [
    "util/event",
    "network/IrcConnection",
    "network/WolError",
    "util/string",
    "util/Base64",
    "util/typeGuard",
    "network/gameopt/FileNameEncoder",
    "network/chat/ChatMessage",
    "network/wolCodes",
    "network/IrcProtocol",
    "network/WolLocale",
    "network/WolConfig",
    "network/gameopt/Parser",
    "@puzzl/core/lib/regexp",
    "network/WolGameReport",
  ],
  function (t, e) {
    "use strict";
    var i, r, a, g, p, s, m, n, o, f, l, c, u, h, d, y, T;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          f = e;
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
          h = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        var e;
        (((e = y || t("WolHasMapStatus", (y = {})))[(e.NoMap = 0)] = "NoMap"),
          (e[(e.HasMap = 1)] = "HasMap"),
          (e[(e.MapTransfer = 2)] = "MapTransfer"),
          t(
            "WolConnection",
            (T = class T {
              get onError() {
                return this.con.onError;
              }
              get onClose() {
                return this.con.onClose;
              }
              get onLoginQueueUpdate() {
                return this._onLoginQueueUpdate;
              }
              get onChatMessage() {
                return this._onChatMessage;
              }
              get onJoinChannel() {
                return this._onJoinChannel;
              }
              get onLeaveChannel() {
                return this._onLeaveChannel;
              }
              get onGameStart() {
                return this._onGameStart;
              }
              get onGameOpt() {
                return this._onGameOpt;
              }
              get onGameMode() {
                return this._onGameMode;
              }
              get onGameServer() {
                return this._onGameServer;
              }
              get onChannelUsers() {
                return this._onChannelUsers;
              }
              get onGameReport() {
                return this._onGameReport;
              }
              get onPartyUpdate() {
                return this._onPartyUpdate;
              }
              static factory(e) {
                return new this(
                  new r.IrcConnection(
                    {
                      mode: "text",
                      logFilter: (e) =>
                        e
                          .replace(/((^|\n)(apgar|pass)) ([^ \n]+)/gi, "$1 <redacted>")
                          .replace(/^(join [^ ]+) ([^ ]+)/gi, "$1 <redacted>")
                          .replace(/^(joingame (([^ ]+ ){2}|([^ ]+ ){8}))([^ ]+)$/gi, "$1<redacted>")
                          .replace(/^((privmsg|page|notice) ([^ ]+ )+):(.+)\r?\n?$/i, (e, t, i, r) =>
                            r === c.MATCH_BOT_NAME + " " ? e : t + ":<redacted>",
                          )
                          .replace(/^(:([^ ]+) (privmsg|page|notice) ([^ ]+ )+):(.+)\r?\n?$/i, (e, t, i) =>
                            i.startsWith(c.MATCH_BOT_NAME + "!") ? e : t + ":<redacted>",
                          ),
                    },
                    e,
                  ),
                  e,
                );
              }
              constructor(e, t) {
                ((this.con = e),
                  (this.logger = t),
                  (this.currentChannels = new Set()),
                  (this.lastChannelOpts = new Map()),
                  (this.pendingChannelUsers = new Map()),
                  (this._onLoginQueueUpdate = new i.EventDispatcher()),
                  (this._onChatMessage = new i.EventDispatcher()),
                  (this._onJoinChannel = new i.EventDispatcher()),
                  (this._onLeaveChannel = new i.EventDispatcher()),
                  (this._onGameStart = new i.EventDispatcher()),
                  (this._onGameOpt = new i.EventDispatcher()),
                  (this._onGameMode = new i.EventDispatcher()),
                  (this._onGameServer = new i.EventDispatcher()),
                  (this._onChannelUsers = new i.EventDispatcher()),
                  (this._onGameReport = new i.EventDispatcher()),
                  (this._onPartyUpdate = new i.EventDispatcher()),
                  (this.handleMessage = (t) => {
                    if ("string" == typeof t) {
                      let e = t.split(" ");
                      var i, r;
                      "ping" === e[0].toLowerCase()
                        ? this.con.sendMessage("PONG" + (e[1] ? " " + e[1] : ""))
                        : "privmsg" === e[1].toLowerCase()
                          ? this.handlePrivMsg(t)
                          : "page" === e[1].toLowerCase() || "notice" === e[1].toLowerCase()
                            ? this.handlePageOrNotice(t)
                            : "join" === e[1].toLowerCase()
                              ? this.handleJoin(t)
                              : "joingame" === e[1].toLowerCase()
                                ? this.handleJoingame(t)
                                : "part" === e[1].toLowerCase()
                                  ? this.handlePart(t)
                                  : "kick" === e[1].toLowerCase()
                                    ? this.handleKick(t)
                                    : "gameopt" === e[1].toLowerCase()
                                      ? this.handleGameOpt(t)
                                      : "mode" === e[1].toLowerCase()
                                        ? this.handleMode(t)
                                        : "startg" === e[1].toLowerCase()
                                          ? this.handleStartGame(t)
                                          : "gserv" === e[1].toLowerCase()
                                            ? this.handleGserv(t)
                                            : ((i = Number(e[1])),
                                              Number.isNaN(i) ||
                                                ((r = { raw: t, code: i, params: e.slice(2), time: Date.now() }),
                                                i === o.RPL_LOGIN_QUEUE
                                                  ? this.handleLoginQueueUpdate(r)
                                                  : i === o.RPL_NAMREPLY
                                                    ? this.handleNamReply(r)
                                                    : i === o.RPL_ENDOFNAMES
                                                      ? this.handleEndOfNames(r)
                                                      : i === o.RPL_GAME_REPORT
                                                        ? this.handleGameReport(r)
                                                        : i === o.RPL_PARTY_UPDATE
                                                          ? this.handlePartyUpdate(t)
                                                          : this.handleIrcError(t)));
                    }
                  }),
                  (this.handleClose = () => {
                    ((this.currentUser = void 0),
                      (this.currentGameChannel = void 0),
                      this.currentChannels.clear(),
                      this.pendingChannelUsers.clear(),
                      this.con.onMessage.unsubscribe(this.handleMessage));
                  }));
              }
              getCurrentUser() {
                return this.currentUser;
              }
              getCurrentChannels() {
                return [...this.currentChannels];
              }
              isInChannel(e) {
                return this.currentChannels.has(e);
              }
              getServerName() {
                return this.serverName;
              }
              async connect(e, t) {
                return (
                  this.con.onMessage.subscribe(this.handleMessage),
                  this.con.onClose.subscribeOnce(this.handleClose),
                  await this.con.connect(e, t)
                );
              }
              close() {
                (this.con.onMessage.unsubscribe(this.handleMessage), this.con.close());
              }
              isOpen() {
                return this.con.isOpen();
              }
              ping(e) {
                return this.con.ping(e);
              }
              async cvers(e, t) {
                let i = await this.con.sendCommand(`cvers ${e} ` + t, {
                  replyCodes: [o.RPL_CVERS_OK, o.RPL_CVERS_OUTDATED],
                });
                if (i[0].code === o.RPL_CVERS_OUTDATED) {
                  var r = i[0].params ? i[0].params.splice(1).join(" ").replace(/^:/, "") : "unknown";
                  throw new a.WolError("Cvers error: " + r, a.WolError.Code.OutdatedClient);
                }
              }
              async login(e, t, i) {
                i && this._onLoginQueueUpdate.subscribe(i);
                let r = await this.con
                  .sendCommand(
                    [
                      "pass " + p.Base64.encode(t),
                      "nick " + e,
                      "user UserName HostName irc.westwood.com :RealName",
                    ].join("\r\n"),
                    {
                      replyCodes: [o.RPL_BAD_LOGIN, o.ERR_YOUREBANNEDCREEP, o.ERR_SERVER_FULL],
                      replyStartCode: o.RPL_MOTDSTART,
                      replyBodyCodes: [o.RPL_MOTD],
                      replyEndCode: o.RPL_ENDOFMOTD,
                      replyHeartbeatCodes: [o.RPL_LOGIN_QUEUE],
                      heartbeatTimeout: Number.POSITIVE_INFINITY,
                    },
                  )
                  .finally(() => {
                    i && this._onLoginQueueUpdate.unsubscribe(i);
                  });
                if (1 === r.length) {
                  var s = r[0].params ? r[0].params.splice(2).join(" ").replace(/^:/, "") : "unknown";
                  if (r[0].code === o.RPL_BAD_LOGIN)
                    throw new a.WolError("Login error: " + s, a.WolError.Code.BadLogin);
                  if (r[0].code === o.ERR_YOUREBANNEDCREEP)
                    throw new a.WolError("Login error: " + s, a.WolError.Code.BannedFromServer, s);
                  if (r[0].code === o.ERR_SERVER_FULL)
                    throw new a.WolError("Login error: " + s, a.WolError.Code.ServerFull);
                }
                return (
                  (this.currentUser = e),
                  (this.serverName = r[0].raw.match(/^:([^\s]+)/)?.[1] || ""),
                  r.slice(0, -1).map((e) => e.raw.replace(/^.*:- /, ""))
                );
              }
              async setLocale(e) {
                await this.con.sendCommand("setlocale " + e, { replyCodes: [o.RPL_SET_LOCALE] });
              }
              async getLocale() {
                if (!this.currentUser) throw new Error("Must login first");
                let e = await this.con.sendCommand("getlocale " + this.currentUser, { replyCodes: [o.RPL_GET_LOCALE] });
                return e[0].params?.[2].split("`")[1] ?? l.WolLocale.Unknown;
              }
              async joinChannel(e, t) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                let i = f.IrcProtocol.escapeChannelName(e);
                var r = "join " + i + (void 0 !== t ? " " + t : ""),
                  r = await this.con.sendCommand(r, {
                    replyCodes: [
                      [o.ERR_NOSUCHCHANNEL, (e) => !!e.params && e.params[1] === this.currentUser && e.params[2] === i],
                      o.ERR_BADCHANNELKEY,
                      o.ERR_CHANNELISFULL,
                      o.ERR_BANNEDFROMCHAN,
                    ],
                    replyMatch: new RegExp(`^:${h.escape(this.currentUser)}![^ ]+ JOIN :[^ ]+ ${h.escape(i)}$`, "i"),
                  });
                if (void 0 !== r[0].code)
                  switch (r[0].code) {
                    case o.ERR_NOSUCHCHANNEL:
                      throw new a.WolError("No such channel", a.WolError.Code.NoSuchChannel);
                    case o.ERR_BADCHANNELKEY:
                      throw new a.WolError("Wrong password", a.WolError.Code.BadChannelPass);
                    case o.ERR_CHANNELISFULL:
                      throw new a.WolError("Channel is full", a.WolError.Code.ChannelFull);
                    case o.ERR_BANNEDFROMCHAN:
                      throw new a.WolError("Banned from channel", a.WolError.Code.BannedFromChannel);
                    default:
                      throw new Error("Unknown error");
                  }
                else this.lastChannelOpts.set(e, t);
              }
              async listUsers(e) {
                let t = await this.con.sendCommand("NAMES " + f.IrcProtocol.escapeChannelName(e), {
                  replyCodes: [o.ERR_NOSUCHCHANNEL, o.ERR_NOTONCHANNEL],
                  replyBodyCodes: [o.RPL_NAMREPLY],
                  replyEndCode: o.RPL_ENDOFNAMES,
                });
                if (t[0].code !== o.RPL_NAMREPLY) throw new Error("Unknown error");
                return this.parseNames(t.slice(0, -1)).sort((e, t) => Number(t.operator) - Number(e.operator));
              }
              async rejoinLastChannels() {
                if (this.lastChannelOpts)
                  for (var [e, t] of this.lastChannelOpts) this.isInChannel(e) || (await this.joinChannel(e, t));
              }
              sendChatMessage(e, t) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                (t.type !== n.ChatRecipientType.Channel && t.type !== n.ChatRecipientType.Whisper) ||
                  this.privmsg([t.name], e);
              }
              privmsg(e, t) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                var i,
                  r = e.map((e) => (e.startsWith("#") ? f.IrcProtocol.escapeChannelName(e) : e)).join(",");
                this.con.sendMessage(`privmsg ${r} :` + t);
                for (i of e) {
                  var s = i.startsWith("#");
                  this._onChatMessage.dispatch(this, {
                    from: this.currentUser,
                    to: { type: s ? n.ChatRecipientType.Channel : n.ChatRecipientType.Whisper, name: i },
                    text: t,
                    time: new Date(),
                  });
                }
              }
              kick(e, t, i) {
                this.con.sendMessage(`kick ${f.IrcProtocol.escapeChannelName(t)} ${e.join(",")} :` + (i || ""));
              }
              partyInvite(e) {
                this.con.sendMessage("PARTY_INVITE " + e);
              }
              partyAccept(e) {
                this.con.sendMessage("PARTY_ACCEPT " + e);
              }
              partyDecline(e) {
                this.con.sendMessage("PARTY_DECLINE " + e);
              }
              partyInviteUnavailable(e) {
                this.con.sendMessage("PARTY_INVITE_UNAVAILABLE " + e);
              }
              partyLeave() {
                this.con.sendMessage("PARTY_LEAVE");
              }
              partyPrevent(e, t) {
                this.con.sendMessage(`PARTY_PREVENT ${e} ` + (t ? "1" : "0"));
              }
              partyStatus() {
                this.con.sendMessage("PARTY_STATUS");
              }
              partyNoInvites(e) {
                this.con.sendMessage("PARTY_NOINVITES " + (e ? "1" : "0"));
              }
              async listGames(e, h) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                let t = await this.con.sendCommand(`list ${e} ` + e, {
                  replyStartCode: o.RPL_LISTSTART,
                  replyBodyCodes: [o.RPL_LIST, o.RPL_GAME_CHANNEL],
                  replyEndCode: o.RPL_LISTEND,
                });
                return t
                  .slice(1, -1)
                  .map((e) => {
                    if (!e.params || e.params.length < 9)
                      throw new Error(`Unexpected reply for list command "${e.raw}". Insufficient params.`);
                    let t = f.IrcProtocol.unescapeChannelName(e.params[1]);
                    var i = e.params[2],
                      r = Number(e.params[4]),
                      s = e.params[5],
                      a = e.params[6],
                      n = e.params[7],
                      [o, l] = e.params[8]?.split("::") ?? [],
                      c = e.params[9];
                    if (r === h && l) {
                      l = new u.Parser().parseTopic(l);
                      if (l)
                        return {
                          hostName: t.match(/^#?([^']+)'s game$/)?.[1] ?? "",
                          hostPing: Number(n),
                          hostMuted: Boolean(Number(c)),
                          name: t,
                          description: l.description,
                          modHash: l.modHash,
                          modName: l.modName,
                          tournament: Boolean(Number(s)),
                          humanPlayers: Number(i),
                          aiPlayers: l.aiPlayers,
                          maxPlayers: l.maxPlayers,
                          observers: l.observers,
                          observable: l.observable,
                          mapName: l.mapName,
                          passLocked: 384 === Number(o),
                          resLocked: Boolean(Number(a)),
                        };
                    }
                  })
                  .filter(s.isNotNullOrUndefined);
              }
              leaveChannel(e) {
                this.currentChannels.has(e) &&
                  (this.lastChannelOpts.delete(e),
                  this.pendingChannelUsers.delete(e),
                  this.con.sendMessage("PART " + f.IrcProtocol.escapeChannelName(e)));
              }
              leaveAllChannels() {
                for (var e of this.getCurrentChannels()) this.leaveChannel(e);
              }
              async createGame(e, t, i, r, s, a, n = !1) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                var o = f.IrcProtocol.escapeChannelName(e);
                (await this.con.sendCommand(
                  `joingame ${o} ${t} ${i} ${r} ` + `${Number(n)} 0 ${Number(s)} 0` + (a ? " " + a : ""),
                  {
                    replyMatch: new RegExp(`^:${h.escape(this.currentUser)}![^ ]+ JOINGAME [^:]+:${h.escape(o)}$`, "i"),
                  },
                ),
                  this.logger.info(`Created game "${e}"`),
                  this.currentChannels.add(e),
                  (this.currentGameChannel = e),
                  this.logger.info(`Joined channel "${e}"`));
              }
              makeGameChannelName() {
                var e = this.getCurrentUser() + "'s game",
                  e = f.IrcProtocol.escapeChannelName("#" + e).slice(0, f.IrcProtocol.MAX_CHANNELNAME_LEN - 1);
                return f.IrcProtocol.unescapeChannelName(e);
              }
              async joinGame(e, t, i = !1) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                var r = f.IrcProtocol.escapeChannelName(e),
                  r = await this.con.sendCommand(`joingame ${r} ${Number(i)} ` + (t || ""), {
                    replyCodes: [o.ERR_BADCHANNELKEY, o.ERR_GAMEHASCLOSED, o.ERR_CHANNELISFULL, o.ERR_BANNEDFROMCHAN],
                    replyMatch: new RegExp(`^:${h.escape(this.currentUser)}![^ ]+ JOINGAME [^:]+:${h.escape(r)}$`, "i"),
                  });
                if (void 0 === r[0].code)
                  return (
                    this.currentChannels.add(e),
                    (this.currentGameChannel = e),
                    void this.logger.info(`Joined channel "${e}"`)
                  );
                switch (r[0].code) {
                  case o.ERR_BADCHANNELKEY:
                    throw new a.WolError("Wrong password", a.WolError.Code.BadChannelPass);
                  case o.ERR_GAMEHASCLOSED:
                    throw new a.WolError("Game has closed", a.WolError.Code.GameHasClosed);
                  case o.ERR_CHANNELISFULL:
                    throw new a.WolError("Channel is full", a.WolError.Code.ChannelFull);
                  case o.ERR_BANNEDFROMCHAN:
                    throw new a.WolError("Banned from channel", a.WolError.Code.BannedFromChannel);
                  default:
                    throw new Error("Unknown error");
                }
              }
              sendGservPing(e, t) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                var i = f.IrcProtocol.escapeChannelName(this.currentGameChannel);
                this.con.sendMessage(`gping ${i} ${e} ` + Math.floor(t));
              }
              startGame(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                var t = e.join(",");
                this.con.sendMessage(`startg ${f.IrcProtocol.escapeChannelName(this.currentGameChannel)} ` + t);
              }
              parseNames(e) {
                let i = [];
                return (
                  e.forEach((e) => {
                    var t = this.parseNamReply(e);
                    i = i.concat(t);
                  }),
                  i
                );
              }
              parseNamReply(e) {
                return e.raw
                  .replace(new RegExp("^.*(=|\\*) [^ ]+ :"), "")
                  .split(" ")
                  .map((e) => e.split(","))
                  .map(([e, , t, i]) => {
                    var r = e.startsWith(T.CHAN_OP_PREFIX),
                      s = Number(t);
                    return {
                      name: r ? e.slice(T.CHAN_OP_PREFIX.length) : e,
                      operator: r,
                      fresh: Boolean(Number(i)),
                      ping: s,
                    };
                  });
              }
              sendPlayerReady(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "A" + (e ? 1 : 0));
              }
              sendPlayerHasMap(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "K" + e);
              }
              sendGameStartRequest() {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "G");
              }
              sendGameSlotsInfo(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "L" + e);
              }
              sendPingData(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "P" + e);
              }
              sendObserverSlot(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, "O" + e);
              }
              sendGameOpts(e) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(this.currentGameChannel, e);
              }
              sendPlayerOpts(e, t, i, r, s) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                return this.gameOpt(e, `R${t},${i},${r},${s},0,0,0`);
              }
              sendModeChannelMax(e, t) {
                this.con.sendMessage(`MODE ${f.IrcProtocol.escapeChannelName(e)} +l ` + t);
              }
              sendGameTopic(e, t, i, r, s, a, n, o, l) {
                if (!this.currentGameChannel) throw new Error("No game channel active");
                var c = new m.FileNameEncoder().encode(a),
                  h = p.Base64.encode(g.utf16ToBinaryString(o.slice(0, T.MAX_ROOM_DESC_LEN - 1))),
                  u = void 0 !== l ? p.Base64.encode(g.utf16ToBinaryString(l.slice(0, T.MAX_ROOM_DESC_LEN - 1))) : "",
                  d = f.IrcProtocol.escapeChannelName(this.currentGameChannel);
                this.con.sendMessage(`topic ${d} :g${e}${t}N39,` + n + `,${i},${r},${s ? 1 : 0},` + c + `,${h},` + u);
              }
              gameOpt(e, t) {
                if (!this.currentUser) throw new Error("Must login first");
                if (!this.currentGameChannel) throw new Error("No game channel active");
                var i = e.startsWith("#") ? f.IrcProtocol.escapeChannelName(e) : e;
                (this.con.sendMessage(`gameopt ${i} :` + t),
                  this._onGameOpt.dispatch(this, { user: this.currentUser, opt: t }));
              }
              handleJoin(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ JOIN :([^ ]+) ([^ ]+)/i);
                if (!t) throw new Error(`Unexpected JOIN message format "${e}"`);
                let [, i, r, s] = t;
                var a = r.trim().split(","),
                  t = f.IrcProtocol.unescapeChannelName(s);
                (this.currentUser === i && (this.currentChannels.add(t), this.logger.info(`Joined channel "${t}"`)),
                  this._onJoinChannel.dispatch(this, {
                    type: "join",
                    user: {
                      name: i,
                      ping: Number(a[1]),
                      operator: Boolean(Number(a[2])),
                      fresh: Boolean(Number(a[3])),
                    },
                    channel: t,
                  }));
              }
              handleJoingame(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ JOINGAME ([^:]+):([^ ]+)/i);
                if (!t) throw new Error(`Unexpected JOINGAME message format "${e}"`);
                let [, i, r, s] = t;
                t = r.trim().split(" ");
                ((s = f.IrcProtocol.unescapeChannelName(s)),
                  i !== this.currentUser && this.logger.info(`Player "${i}" joined game "${s}"`),
                  this._onJoinChannel.dispatch(this, {
                    type: "join",
                    user: { name: i, operator: !1, ping: Number(t[5]), fresh: Boolean(Number(t[6])) },
                    channel: s,
                  }));
              }
              handleStartGame(e) {
                var t = e.match(/^:[^ ]+ STARTG [^:]+:([^ ]+) :([^ ]+) (\d+)/i);
                if (!t) throw new Error(`Unexpected STARTG message format "${e}"`);
                var [, i, r, t] = t;
                this._onGameStart.dispatch(this, { gameId: r, timestamp: Number(t), gservUrl: i });
              }
              handleGserv(e) {
                var t = e.match(/^[^ ]+ GSERV [^:]+:([^ ]+) ([^ ]+)/i);
                if (!t) throw new Error(`Unexpected GSERV message format "${e}"`);
                var [, i, t] = t;
                this._onGameServer.dispatch(this, { id: i, url: t });
              }
              handlePrivMsg(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ PRIVMSG ([^ ]+) :(.*)/i);
                if (!t) throw new Error(`Unexpected PRIVMSG message format "${e}"`);
                let [, i, r, s] = t,
                  a;
                t = new Date();
                (r.startsWith("#")
                  ? (a = {
                      from: i,
                      to: { type: n.ChatRecipientType.Channel, name: f.IrcProtocol.unescapeChannelName(r) },
                      text: s,
                      time: t,
                    })
                  : r === this.currentUser &&
                    (a = { from: i, to: { type: n.ChatRecipientType.Whisper, name: r }, text: s, time: t }),
                  a && this._onChatMessage.dispatch(this, a));
              }
              handleLoginQueueUpdate(e) {
                if (!e.params) throw new Error("Unexpected queue update reply " + e.raw);
                let [, t, i] = e.params;
                this._onLoginQueueUpdate.dispatch(this, {
                  position: Number(t.slice(1)),
                  avgWaitSeconds: i ? Number(i) : 0,
                });
              }
              handlePartyUpdate(e) {
                let t = e.split(" ");
                const i = t.slice(3).join(" ");
                var r = i.startsWith(":") ? i.slice(1) : i;
                r && this._onPartyUpdate.dispatch(this, r);
              }
              handleNamReply(e) {
                if (!e.params) throw new Error(`Missing NAMREPLY params: "${e.raw}"`);
                var t = f.IrcProtocol.unescapeChannelName(e.params[2]),
                  i = this.parseNamReply(e);
                let r = this.pendingChannelUsers.get(t);
                r ? r.push(...i) : this.pendingChannelUsers.set(t, i);
              }
              handleEndOfNames(e) {
                if (!e.params) throw new Error(`Missing ENDOFNAMES params: "${e.raw}"`);
                var t = f.IrcProtocol.unescapeChannelName(e.params[1]);
                let i = this.pendingChannelUsers.get(t) ?? [];
                (i.sort((e, t) => Number(t.operator) - Number(e.operator)),
                  this.pendingChannelUsers.delete(t),
                  this._onChannelUsers.dispatch(this, { channelName: t, users: i }));
              }
              handleGameReport(e) {
                if (!e.params) throw new Error(`Missing GAME_REPORT params: "${e.raw}"`);
                if (e.params.length < 2)
                  throw new Error("Insufficient number of params for GAME_REPORT: " + e.params.length);
                var t = new d.WolGameReport(e.params[1].slice(1));
                this._onGameReport.dispatch(this, t);
              }
              handleIrcError(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+) (\d+) ([^ ]+) (?:([^ ]*) )?:(.*)/i);
                if (t) {
                  var [, i, r, s, , t] = t;
                  if (
                    [o.ERR_NOSUCHNICK, o.ERR_NOSUCHCHANNEL, o.ERR_NOTONCHANNEL, o.ERR_CHANOPRIVSNEEDED].includes(
                      Number(r),
                    )
                  ) {
                    let e;
                    (s === this.currentUser &&
                      (e = { from: i, to: { type: n.ChatRecipientType.Page, name: s }, text: t, time: new Date() }),
                      e && this._onChatMessage.dispatch(this, e));
                  }
                }
              }
              handlePageOrNotice(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)(?:![^ ]+)? (?:PAGE|NOTICE) ([^ ]+) :(.*)/i);
                if (!t) throw new Error(`Unexpected PAGE message format "${e}"`);
                var [, i, r, t] = t,
                  r = { text: t, from: i, to: { type: n.ChatRecipientType.Page, name: r }, time: new Date() };
                this._onChatMessage.dispatch(this, r);
              }
              handlePart(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ PART ([^ ]+)/i);
                if (!t) throw new Error(`Unexpected PART message format "${e}"`);
                var [, i, t] = t,
                  t = f.IrcProtocol.unescapeChannelName(t);
                (i === this.currentUser
                  ? (t === this.currentGameChannel && (this.currentGameChannel = void 0),
                    this.currentChannels.delete(t),
                    this.lastChannelOpts.delete(t),
                    this.pendingChannelUsers.delete(t),
                    this.logger.info(`Left channel "${t}"`))
                  : t === this.currentGameChannel && this.logger.info(`Player "${i}" left game "${t}"`),
                  this._onLeaveChannel.dispatch(this, { type: "leave", user: { name: i }, channel: t }));
              }
              handleKick(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ KICK ([^ ]+) ([A-Za-z0-9-_]+)/i);
                if (!t) throw new Error(`Unexpected KICK message format "${e}"`);
                var [, , i, t] = t,
                  i = f.IrcProtocol.unescapeChannelName(i);
                (t === this.currentUser &&
                  (i === this.currentGameChannel && (this.currentGameChannel = void 0),
                  this.currentChannels.delete(i),
                  this.lastChannelOpts.delete(i),
                  this.pendingChannelUsers.delete(i),
                  this.logger.info(`Left channel "${i}"`)),
                  this._onLeaveChannel.dispatch(this, { type: "leave", user: { name: t }, channel: i }));
              }
              handleGameOpt(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ GAMEOPT ([^ ]+) :(.*)/i);
                if (!t) throw new Error(`Unexpected GAMEOPT message format"${e}"`);
                var [, i, , t] = t;
                this._onGameOpt.dispatch(this, { user: i, opt: t });
              }
              handleMode(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+)![^ ]+ MODE ([^ ]+) \+l (\d+)/i);
                t
                  ? (([, , , t] = t), this._onGameMode.dispatch(this, Number(t)))
                  : this.logger.warn("Got unknown MODE line: " + e);
              }
            }),
          ),
          (T.MAX_ROOM_DESC_LEN = 64),
          (T.CHAN_OP_PREFIX = "@"));
      },
    };
  },
);
