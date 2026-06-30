// === Reconstructed SystemJS module: network/GservConnection ===
// deps: ["util/event","data/DataStream","network/IrcConnection","network/gservCodes","network/GservError","network/gservConfig","network/gameopt/Parser","network/gameopt/Serializer","network/chat/ChatMessage","util/Base64"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/GservConnection",
  [
    "util/event",
    "data/DataStream",
    "network/IrcConnection",
    "network/gservCodes",
    "network/GservError",
    "network/gservConfig",
    "network/gameopt/Parser",
    "network/gameopt/Serializer",
    "network/chat/ChatMessage",
    "util/Base64",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, c, h, n, a, o, l, u, d, g;
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
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
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
          l = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((d = new Map([
          [c.RPL_BAD_LOGIN, h.GservError.Code.BadLogin],
          [c.RPL_TOO_MANY_LOGIN_ATTEMPTS, h.GservError.Code.TooManyLoginAttempts],
          [c.RPL_ALREADY_LOGGED_IN, h.GservError.Code.AlreadyLoggedIn],
          [c.RPL_INSTANCE_EXISTS, h.GservError.Code.InstanceAlreadyExists],
          [c.RPL_INSTANCE_TOO_MANY, h.GservError.Code.CreatedTooManyInstances],
          [c.RPL_INSTANCE_NONEXISTENT, h.GservError.Code.InstanceNonExistent],
          [c.RPL_INSTANCE_NOT_ALLOWED, h.GservError.Code.InstanceNotAllowed],
          [c.RPL_INSTANCE_ALREADY_STARTED, h.GservError.Code.InstanceAlreadyStarted],
          [c.RPL_INSTANCE_VERS_MISMATCH, h.GservError.Code.InstanceVersMismatch],
        ])),
          e(
            "GservConnection",
            (g = class {
              get onError() {
                return this.con.onError;
              }
              get onClose() {
                return this.con.onClose;
              }
              get onLoadInfo() {
                return this._onLoadInfo.asEvent();
              }
              get onGameStart() {
                return this._onGameStart.asEvent();
              }
              get onGameActions() {
                return this._onGameActions.asEvent();
              }
              get onGameDesync() {
                return this._onGameDesync.asEvent();
              }
              get onRateChange() {
                return this._onRateChange.asEvent();
              }
              get onChatMessage() {
                return this._onChatMessage.asEvent();
              }
              get onTaunt() {
                return this._onTaunt.asEvent();
              }
              get onPlayerDisconnect() {
                return this._onPlayerDisconnect.asEvent();
              }
              get onPrivMsgNotAllowed() {
                return this._onPrivMsgNotAllowed.asEvent();
              }
              static factory(e) {
                return new this(
                  new s.IrcConnection(
                    {
                      mode: "text",
                      binaryRplPrefix: c.RPL_BIN_PREFIX,
                      binaryReqPrefix: c.REQ_BIN_PREFIX,
                      logFilter: (e) =>
                        e
                          .replace(/^(user [^ ]+) ([^ ]+)/i, "$1 <redacted>")
                          .replace(/^((:.+!.+@.+)?privmsg ([^ ]+ )+):(.+)\r?\n?$/i, "$1:<redacted>"),
                    },
                    e,
                  ),
                );
              }
              constructor(e) {
                ((this._onLoadInfo = new i.EventDispatcher()),
                  (this._onGameStart = new i.EventDispatcher()),
                  (this._onGameActions = new i.EventDispatcher()),
                  (this._onGameDesync = new i.EventDispatcher()),
                  (this._onRateChange = new i.EventDispatcher()),
                  (this._onChatMessage = new i.EventDispatcher()),
                  (this._onTaunt = new i.EventDispatcher()),
                  (this._onPlayerDisconnect = new i.EventDispatcher()),
                  (this._onPrivMsgNotAllowed = new i.EventDispatcher()),
                  (this.handleMessage = (t) => {
                    if ("string" == typeof t) {
                      let e = t.split(" ");
                      var i, r;
                      "ping" === e[0]
                        ? this.isOpen() && this.con.sendMessage("pong" + (e[1] ? " " + e[1] : ""))
                        : "privmsg" === e[1].toLowerCase()
                          ? this.handlePrivMsg(t)
                          : e[1] === "" + c.RPL_LOAD_INFO
                            ? this.handleLoadInfo(e[3])
                            : e[1] === "" + c.RPL_GAME_START
                              ? this.handleGameStart()
                              : e[1] === "" + c.RPL_GAME_DESYNC
                                ? this._onGameDesync.dispatch(this)
                                : e[1] === "" + c.RPL_NET_RATE
                                  ? (([i, r] = e[3].slice(1).split(",")),
                                    this._onRateChange.dispatch(this, { rate: Number(i), turnNo: Number(r) }))
                                  : e[1] === "" + c.RPL_TAUNT
                                    ? this._onTaunt.dispatch(this, {
                                        from: e[0].replace(/^:/, ""),
                                        tauntNo: Number(e[3].replace(/^:/, "")),
                                      })
                                    : e[1] === "" + c.RPL_PLAYER_DISCONNECT
                                      ? this._onPlayerDisconnect.dispatch(this, e[3].replace(/^:/, ""))
                                      : e[1] === "" + c.RPL_PRIVMSG_NOT_ALLOWED &&
                                        this._onPrivMsgNotAllowed.dispatch(this);
                    } else t[0] === c.RPL_BIN_GAME_ACTIONS && this.handlePlayerActions(t.slice(1));
                  }),
                  (this.con = e));
              }
              getCurrentUser() {
                return this.currentUser;
              }
              getServerName() {
                return this.serverName;
              }
              async connect(e, t) {
                return (this.con.onMessage.subscribe(this.handleMessage), await this.con.connect(e, t));
              }
              close() {
                (this.con.onMessage.unsubscribe(this.handleMessage), this.con.close(), (this.currentUser = void 0));
              }
              isOpen() {
                return this.con.isOpen();
              }
              async cvers(e) {
                let t = await this.con.sendCommand(`cvers ${e} ` + n.API_VERSION, {
                  replyCodes: [c.RPL_CVERS_OK, c.RPL_CVERS_OUTDATED],
                });
                if (t[0].code === c.RPL_CVERS_OUTDATED) {
                  var i = t[0].params ? t[0].params.splice(1).join(" ").replace(/^:/, "") : "unknown";
                  throw new h.GservError("Cvers error: " + i, h.GservError.Code.OutdatedClient);
                }
              }
              async login(e, t) {
                let i = await this.con.sendCommand(`user ${e} ` + u.Base64.encode(t), {
                  replyCodes: [
                    c.RPL_LOGGED_IN,
                    c.RPL_BAD_LOGIN,
                    c.RPL_TOO_MANY_LOGIN_ATTEMPTS,
                    c.RPL_ALREADY_LOGGED_IN,
                  ],
                  timeout: 10,
                });
                if (i[0].code !== c.RPL_LOGGED_IN) {
                  var r = d.get(i[0].code) ?? h.GservError.Code.Unknown,
                    s = i[0].params ? i[0].params.splice(1).join(" ").replace(/^:/, "") : "unknown";
                  throw new h.GservError("Login error: " + s, r);
                }
                ((this.currentUser = e), (this.serverName = i[0].raw.match(/^:([^\s]+)/)?.[1] || ""));
              }
              async createGame(e, t, i, r, s, a = !1) {
                if (i.includes(" ")) throw new Error("Game opts string cannot include spaces");
                let n = await this.con.sendCommand(`create ${e} ${t} ${i} ${r} ${s} ` + Number(a), {
                  replyCodes: [
                    c.RPL_INSTANCE_CREATED,
                    c.RPL_INSTANCE_EXISTS,
                    c.RPL_INSTANCE_TOO_MANY,
                    c.RPL_INSTANCE_NOT_ALLOWED,
                  ],
                });
                if (n[0].code !== c.RPL_INSTANCE_CREATED) {
                  var o = d.get(n[0].code) ?? h.GservError.Code.Unknown,
                    l = n[0].params ? n[0].params.splice(1).join(" ").replace(/^:/, "") : "unknown";
                  throw new h.GservError("Create error: " + l, o);
                }
              }
              async joinGame(e, t, i) {
                let r = await this.con.sendCommand(`join ${e} ${t} ` + i, {
                  replyCodes: [
                    c.RPL_INSTANCE_CONNECTED,
                    c.RPL_INSTANCE_NONEXISTENT,
                    c.RPL_INSTANCE_NOT_ALLOWED,
                    c.RPL_INSTANCE_ALREADY_STARTED,
                    c.RPL_INSTANCE_VERS_MISMATCH,
                  ],
                });
                if (r[0].code !== c.RPL_INSTANCE_CONNECTED) {
                  var s = d.get(r[0].code) ?? h.GservError.Code.Unknown,
                    a = r[0].params ? r[0].params.splice(1).join(" ").replace(/^:/, "") : "unknown";
                  throw new h.GservError("Join error: " + a, s);
                }
              }
              async gameOpts() {
                let e = await this.con.sendCommand("gameopts", { replyCodes: [c.RPL_GAME_OPTS] });
                if (!e[0].params) throw new Error("Unexpected server reply for getopts command. Missing params.");
                return e[0].params.splice(1).join(" ").replace(/^:/, "");
              }
              sendLoadedPercent(e) {
                this.con.sendMessage("loaded " + e);
              }
              requestLoadInfo() {
                this.con.sendMessage("loadinfo");
              }
              sendGameStateHash(e, t) {
                let i = new r.DataStream(10);
                ((i.dynamicSize = !1),
                  i.writeUint8(c.REQ_BIN_PREFIX),
                  i.writeUint8(c.REQ_BIN_GAME_STATE_HASH),
                  i.writeUint32(e),
                  i.writeUint32(t),
                  this.con.sendMessage(i.toUint8Array()));
              }
              sendPlayerActive(e) {
                this.con.sendMessage("active " + (e ? 1 : 0));
              }
              sendTaunt(e) {
                this.con.sendMessage("taunt " + e);
              }
              async ping(e) {
                return await this.con.ping(e);
              }
              sendPlayerActions(e, t) {
                let i = new r.DataStream(6);
                (i.writeUint8(c.REQ_BIN_PREFIX),
                  i.writeUint8(c.REQ_BIN_GAME_ACTIONS),
                  i.writeUint32(e),
                  i.writeUint8Array(t),
                  this.con.sendMessage(i.toUint8Array()));
              }
              sendMap(e) {
                let t = new r.DataStream(2);
                (t.writeUint8(c.REQ_BIN_PREFIX),
                  t.writeUint8(c.REQ_BIN_PUT_MAP),
                  t.writeUint8Array(new o.Serializer().serializeMapData(e)),
                  this.con.sendMessage(t.toUint8Array()));
              }
              async getMap() {
                let e = new r.DataStream(2);
                ((e.dynamicSize = !1), e.writeUint8(c.REQ_BIN_PREFIX), e.writeUint8(c.REQ_BIN_GET_MAP));
                var t = await this.con.sendBinCommand(e.toUint8Array(), {
                  replyCodes: [c.RPL_BIN_MAP_DATA],
                  timeout: 15,
                });
                return new a.Parser().parseMapData(t.data);
              }
              handleLoadInfo(e) {
                this._onLoadInfo.dispatch(this, e.replace(/^:/, ""));
              }
              handleGameStart() {
                this._onGameStart.dispatch(this, void 0);
              }
              handlePlayerActions(e) {
                this._onGameActions.dispatch(this, e);
              }
              sayChannel(e) {
                this.privmsg([n.RECIPIENT_ALL], e);
              }
              privmsg(e, t) {
                if (!this.currentUser) throw new Error("Must login before sending messages");
                var i;
                t.length && ((i = e.join(",")), this.con.sendMessage(`privmsg ${i} :` + t));
              }
              handlePrivMsg(e) {
                var t = e.match(/^:([A-Za-z0-9-_]+) PRIVMSG ([A-Za-z0-9-_#']+) :(.*)/i);
                if (!t) throw new Error(`Unexpected PRIVMSG message format "${e}"`);
                var [, i, r, s] = t;
                let a;
                t = new Date();
                (r === n.RECIPIENT_ALL
                  ? (a = { from: i, to: { type: l.ChatRecipientType.Channel, name: r }, text: s, time: t })
                  : r === this.currentUser &&
                    (a = {
                      from: i,
                      to:
                        i === this.getServerName()
                          ? { type: l.ChatRecipientType.Page, name: r }
                          : { type: l.ChatRecipientType.Channel, name: n.RECIPIENT_TEAM },
                      text: s,
                      time: t,
                    }),
                  a && this._onChatMessage.dispatch(this, a));
              }
            }),
          ));
      },
    };
  },
);
