// === Reconstructed SystemJS module: network/IrcConnection ===
// deps: ["@puzzl/core/lib/async/cancellation","util/event","util/Logger","util/string","util/time"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/IrcConnection",
  ["@puzzl/core/lib/async/cancellation", "util/event", "util/Logger", "util/string", "util/time"],
  function (e, t) {
    "use strict";
    var a, i, r, h, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
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
          p = e;
        },
      ],
      execute: function () {
        (e(
          "IrcConnection",
          (m = class m {
            constructor(e, t) {
              ((this.options = e),
                (this.logger = t),
                (this.timeout = 5),
                (this._onMessage = new i.EventDispatcher()),
                (this._onError = new i.EventDispatcher()),
                (this._onClose = new i.EventDispatcher()),
                (this.messageBuffer = ""));
            }
            get onMessage() {
              return this._onMessage.asEvent();
            }
            get onError() {
              return this._onError.asEvent();
            }
            get onClose() {
              return this._onClose.asEvent();
            }
            async connect(r, s) {
              let e = s?.timeoutSeconds ? setTimeout(() => this.close(), 1e3 * s.timeoutSeconds) : void 0;
              return (
                s?.cancelToken?.register(() => {
                  e && (clearTimeout(e), this.close());
                }),
                new Promise((e, t) => {
                  ((this.socket = new WebSocket(r)),
                    "arraybuffer" !== this.socket.binaryType && (this.socket.binaryType = "arraybuffer"));
                  let i = (e) => {
                    (this.socket.removeEventListener("error", i),
                      s?.cancelToken?.isCancelled()
                        ? t(new a.OperationCanceledError(s.cancelToken))
                        : t(new m.ConnectError(`Connection to "${r}" failed`)));
                  };
                  (this.socket.addEventListener("open", () => {
                    (this.socket.removeEventListener("error", i),
                      this.socket.addEventListener("error", (e) => this.handleError(e)),
                      this.handleOpen(),
                      e());
                  }),
                    this.socket.addEventListener("error", i),
                    this.socket.addEventListener("close", (e) => this.handleClose(e)),
                    this.socket.addEventListener("message", (e) => {
                      e.data instanceof ArrayBuffer
                        ? this.handleMessage(new Uint8Array(e.data))
                        : this.handleMessage(e.data);
                    }));
                }).finally(() => {
                  e && clearTimeout(e);
                })
              );
            }
            handleOpen() {
              this.logger.info("Connection open to " + this.socket.url);
            }
            handleError(e) {
              (this.logger.error("Connection error", e), this._onError.dispatch(this, e));
            }
            handleClose(e) {
              (this.logger.info(`Connection closed (${this.socket.url})`, e), this._onClose.dispatch(this, e));
            }
            handleMessage(e) {
              if ("string" != typeof e) {
                if (e[0] === this.options.binaryRplPrefix) return void this._onMessage.dispatch(this, e.slice(1));
                e = h.uint8ArrayToBinaryString(e);
              }
              (this.logger.enabledFor(r.AppLogger.DEBUG) &&
                this.logger.debug("Got message:", "string" == typeof e ? (this.options.logFilter?.(e) ?? e) : e),
                (e = this.messageBuffer + e),
                (this.messageBuffer = ""));
              let t = e.split(/\r?\n/);
              var i = t.pop();
              (i.length && (this.messageBuffer = i),
                t.filter((e) => !!e).forEach((e) => this._onMessage.dispatch(this, e)));
            }
            async sendCommand(e, l) {
              if (l.replyStartCode && !l.replyEndCode)
                throw new Error("Invalid argument. Expected a reply end code, but got only a start code.");
              let c = [];
              return await this.sendRawCommand(
                e,
                (e, s, a, n) => {
                  let o = (e, t) => {
                    if ("number" == typeof e) return t.code === e;
                    let [i, r] = e;
                    return t.code === i && r(t);
                  };
                  if ("string" != typeof e) {
                    if (e[0] === this.options.binaryRplPrefix) return !1;
                    e = h.uint8ArrayToBinaryString(e);
                  }
                  return l.replyRawText
                    ? (a(e.split(/\r?\n/).map((e) => ({ raw: e, time: s }))), !0)
                    : e
                        .split(/\r?\n/)
                        .filter((e) => !!e)
                        .some((e) =>
                          ((e) => {
                            if (l.replyMatch) {
                              if (l.replyMatch.exec(e)) return (a([{ raw: e, time: s }]), !0);
                              if (!l.replyCodes) return !1;
                            }
                            if (!l.replyEndCode && !l.replyCodes) return (a([{ raw: e, time: s }]), !0);
                            var [, t, ...i] = e.split(" "),
                              t = parseInt(t, 10);
                            let r = { raw: e, code: t, params: i, time: s };
                            if (l.replyEndCode)
                              return l.replyCodes && l.replyCodes.some((e) => o(e, r))
                                ? (a([r]), !0)
                                : (l.replyHeartbeatCodes &&
                                    -1 !== l.replyHeartbeatCodes.indexOf(t) &&
                                    n(l.heartbeatTimeout),
                                  (t === l.replyStartCode ||
                                    (l.replyBodyCodes && -1 !== l.replyBodyCodes.indexOf(t)) ||
                                    t === l.replyEndCode) &&
                                    c.push(r),
                                  t === l.replyEndCode && (a(c), !0));
                            if (void 0 === l.replyCodes)
                              throw new Error("List of replyCodes must be specified when not using start/end codes");
                            return !!l.replyCodes.some((e) => o(e, r)) && (a([r]), !0);
                          })(e),
                        );
                },
                l.timeout,
              );
            }
            async sendBinCommand(e, s) {
              const a = this.options.binaryRplPrefix;
              if (!a) throw new Error("Must configure binary message reply prefix to send binary commands");
              const t = this.options.binaryReqPrefix;
              if (!t) throw new Error("Must configure binary message request prefix to send binary commands");
              if (e[0] !== t) throw new Error("Binary command must start with the magic prefix 0x" + t.toString(16));
              return await this.sendRawCommand(
                e,
                (e, t, i) => {
                  if ("string" == typeof e || e[0] !== a) return !1;
                  var r = e[1];
                  return -1 !== s.replyCodes.indexOf(r) && (i({ code: r, data: e.slice(2), time: t }), !0);
                },
                s.timeout,
              );
            }
            sendRawCommand(u, d, g) {
              return new Promise((t, i) => {
                let e = !1,
                  r,
                  s = (e) => {
                    (clearTimeout(r),
                      void 0 !== e && Number.isFinite(e) && (r = setTimeout(o, 1e3 * (e ?? g ?? this.timeout))));
                  },
                  a = (e) => {
                    (clearTimeout(r), t(e));
                  },
                  n = (e) => {
                    (this.socket.removeEventListener("message", h),
                      this.socket.removeEventListener("close", l),
                      clearTimeout(r),
                      (r = void 0),
                      i(e));
                  },
                  o = () => {
                    var e = "string" == typeof u ? (this.options.logFilter?.(u) ?? u) : "0x" + u[1].toString(16);
                    n(new m.NoReplyError("Timeout reached for command " + e));
                  },
                  l = async () => {
                    for (; e;) await p.sleep(10);
                    c || n(new m.SocketError("Connection was closed prematurely"));
                  },
                  c = !1,
                  h = (e) => {
                    var t;
                    c ||
                      ((t = Date.now()),
                      e.data instanceof ArrayBuffer
                        ? c ||
                          (d(new Uint8Array(e.data), t, a, s) &&
                            ((c = !0),
                            this.socket.removeEventListener("message", h),
                            this.socket.removeEventListener("close", l)))
                        : d(e.data, t, a, s) &&
                          ((c = !0),
                          this.socket.removeEventListener("message", h),
                          this.socket.removeEventListener("close", l)));
                  };
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                  ((r = setTimeout(o, 1e3 * (g ?? this.timeout))),
                    this.socket.addEventListener("message", h),
                    this.socket.addEventListener("close", l));
                  try {
                    this.sendMessage(u);
                  } catch (e) {
                    n(e);
                  }
                } else
                  n(
                    new m.SocketError(
                      "Send command failed. Socket is not open." +
                        (this.socket ? ` (readyState = ${this.socket.readyState})` : ""),
                    ),
                  );
              });
            }
            sendMessage(e) {
              if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
                throw new m.SocketError(
                  "Socket is not open" + (this.socket ? ` (readyState = ${this.socket.readyState})` : ""),
                );
              (this.logger.enabledFor(r.AppLogger.DEBUG) &&
                this.logger.debug("Sent message:", "string" == typeof e ? (this.options.logFilter?.(e) ?? e) : e),
                "string" == typeof e && (e += "\r\n"));
              let t;
              ((t = "binary" === this.options.mode && "string" == typeof e ? h.binaryStringToUint8Array(e) : e),
                this.socket.send(t));
            }
            async ping(e) {
              var t = Date.now();
              return (
                (
                  await this.sendCommand("ping :" + t, {
                    replyMatch: new RegExp("^:[^ ]+ PONG [^ :]+ :" + t, "i"),
                    timeout: e,
                  })
                )[0].time - t
              );
            }
            close() {
              this.socket && this.socket.close();
            }
            isOpen() {
              return this.socket && this.socket.readyState === WebSocket.OPEN;
            }
          }),
        ),
          (function (e) {
            class t extends Error {
              constructor(e) {
                super(e);
              }
            }
            e.NoReplyError = t;
            class i extends Error {
              constructor(e) {
                super(e);
              }
            }
            e.SocketError = i;
            class r extends Error {
              constructor(e) {
                super(e);
              }
            }
            e.ConnectError = r;
          })(m || e("IrcConnection", (m = {}))));
      },
    };
  },
);
