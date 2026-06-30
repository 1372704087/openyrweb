// === Reconstructed SystemJS module: network/WolService ===
// deps: ["util/event","engine/ResourceLoader","data/IniFile","network/WolError","network/WolLocale","network/IrcConnection"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/WolService",
  [
    "util/event",
    "engine/ResourceLoader",
    "data/IniFile",
    "network/WolError",
    "network/WolLocale",
    "network/IrcConnection",
  ],
  function (e, t) {
    "use strict";
    var s, a, n, o, l, c, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
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
      ],
      execute: function () {
        (e(
          "WolService",
          (h = class h {
            get onWolConnectionLost() {
              return this._onWolConnectionLost.asEvent();
            }
            constructor(e, t, i, r) {
              ((this.wolConfig = e),
                (this.wolCon = t),
                (this.clientVersion = i),
                (this.clientLocale = r),
                (this.ignoreLastWolClose = !1),
                (this._onWolConnectionLost = new s.EventDispatcher()),
                (this.autoReconnect = !1),
                (this.pendingReconnect = !1),
                (this.onWolClose = (e) => {
                  (this.connectOpts &&
                    !this.ignoreLastWolClose &&
                    (this.autoReconnect &&
                      !this.pendingReconnect &&
                      (this.reconnectTimeout = setTimeout(() => this.tryReconnect(h.MIN_RECONNECT_MILLIS), 0)),
                    this._onWolConnectionLost.dispatch(this, e)),
                    (this.ignoreLastWolClose = !1));
                }),
                (this.onGameReport = (e) => {
                  this.lastGameReport = e;
                }));
            }
            init() {
              (this.wolCon.onGameReport.subscribe(this.onGameReport), this.wolCon.onClose.subscribe(this.onWolClose));
            }
            getConfig() {
              return this.wolConfig;
            }
            getConnection() {
              return this.wolCon;
            }
            isConnected() {
              return this.wolCon.isOpen();
            }
            getCredentials() {
              return this.connectOpts ? { user: this.connectOpts.user, pass: this.connectOpts.pass } : void 0;
            }
            getLastGameReport() {
              return this.lastGameReport;
            }
            async connectAndLogin(e, t) {
              var i,
                { url: r, user: s, pass: a } = e;
              (this.cancelReconnect(),
                this.wolCon.isOpen() &&
                  JSON.stringify(this.connectOpts) !== JSON.stringify(e) &&
                  this.closeWolConnection(),
                (this.connectOpts = e),
                (this.ignoreLastWolClose = !0));
              try {
                (await this.wolCon.connect(r),
                  await this.wolCon.cvers(this.clientVersion, this.wolConfig.getClientSku()),
                  void 0 === this.clientLocale ||
                    (void 0 !== (i = l.localeCodeMap.get(this.clientLocale)) && (await this.wolCon.setLocale(i))));
                let e = await this.wolCon.login(s, a, t);
                return ((this.ignoreLastWolClose = !1), e.map((e) => ({ text: e })));
              } catch (e) {
                throw (
                  e instanceof o.WolError ||
                    e instanceof c.IrcConnection.ConnectError ||
                    e instanceof c.IrcConnection.SocketError ||
                    (this.ignoreLastWolClose = !1),
                  e
                );
              }
            }
            async loadServerList(e, t) {
              let i = new a.ResourceLoader("");
              var r = await i.loadText(e, t);
              return new n.IniFile().fromString(r);
            }
            async validateGameVersion(e) {
              if (e.gameVersion && !this.matchVersions(this.clientVersion, e.gameVersion))
                throw new o.WolError(
                  `Game version mismatch: client version is ${this.clientVersion}, but expected ` + e.gameVersion,
                  o.WolError.Code.OutdatedClient,
                );
            }
            matchVersions(e, t) {
              let [i, r, s] = e.split(".");
              var [a, n, o] = t.split(".");
              return i === a && r === n && Number(s.split("-")[0]) >= Number(o);
            }
            async tryReconnect(t) {
              if (this.connectOpts && !this.pendingReconnect)
                try {
                  ((this.pendingReconnect = !0),
                    await this.connectAndLogin(this.connectOpts),
                    await this.wolCon.rejoinLastChannels());
                } catch (e) {
                  if (e instanceof o.WolError) console.error("Failed to reconnect to WoL service", e);
                  else {
                    let e = Math.min(h.MAX_RECONNECT_MILLIS, 2 * t);
                    this.reconnectTimeout = setTimeout(() => this.tryReconnect(e), t);
                  }
                } finally {
                  this.pendingReconnect = !1;
                }
            }
            setAutoReconnect(e) {
              e !== this.autoReconnect && ((this.autoReconnect = e) || this.cancelReconnect());
            }
            closeWolConnection() {
              (this.cancelReconnect(),
                this.wolCon.isOpen() &&
                  ((this.connectOpts = void 0),
                  (this.ignoreLastWolClose = !0),
                  this.wolCon.leaveAllChannels(),
                  this.wolCon.close()));
            }
            dispose() {
              (this.cancelReconnect(),
                this.wolCon.onGameReport.unsubscribe(this.onGameReport),
                this.wolCon.onClose.unsubscribe(this.onWolClose));
            }
            cancelReconnect() {
              (this.pendingReconnect && this.wolCon.close(),
                this.reconnectTimeout && (clearTimeout(this.reconnectTimeout), (this.reconnectTimeout = void 0)));
            }
          }),
        ),
          (h.MIN_RECONNECT_MILLIS = 5e3),
          (h.MAX_RECONNECT_MILLIS = 6e4));
      },
    };
  },
);
