// === Reconstructed SystemJS module: gui/screen/game/PingMonitor ===
// deps: ["network/IrcConnection","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/PingMonitor", ["network/IrcConnection", "util/event"], function (e, t) {
  "use strict";
  var i, a, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "PingMonitor",
        (r = class {
          get onNewSample() {
            return this._onNewSample.asEvent();
          }
          constructor(e, t, i, r = 1e3, s = 5) {
            ((this.gameTurnMgr = e),
              (this.gservCon = t),
              (this.avgPing = i),
              (this.pingIntervalMillis = r),
              (this.pingTimeoutSeconds = s),
              (this.isDisposed = !1),
              (this._onNewSample = new a.EventDispatcher()));
          }
          monitor() {
            ((this.isDisposed = !1),
              this.pingTimeoutId ??
                (this.pingTimeoutId = setTimeout(() => this.updatePing(), this.pingIntervalMillis)));
          }
          setPingInterval(e) {
            e !== this.pingIntervalMillis &&
              ((this.pingIntervalMillis = e),
              this.pingTimeoutId && (clearTimeout(this.pingTimeoutId), this.updatePing()));
          }
          async updatePing() {
            if (((this.pingTimeoutId = void 0), !this.gameTurnMgr.getErrorState() && this.gservCon.isOpen())) {
              let t;
              try {
                if (((t = await this.gservCon.ping(this.pingTimeoutSeconds)), this.isDisposed || this.pingTimeoutId))
                  return;
              } catch (e) {
                (e instanceof i.IrcConnection.NoReplyError || console.error(e), (t = 1e3 * this.pingTimeoutSeconds));
              }
              (this.avgPing.pushSample(t),
                this._onNewSample.dispatch(this, t),
                (this.pingTimeoutId = setTimeout(() => this.updatePing(), this.pingIntervalMillis)));
            }
          }
          dispose() {
            (this.pingTimeoutId && clearTimeout(this.pingTimeoutId),
              (this.isDisposed = !0),
              (this._onNewSample = new a.EventDispatcher()));
          }
        }),
      );
    },
  };
});
