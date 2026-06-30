// === Reconstructed SystemJS module: engine/GameAnimationLoop ===
// deps: ["network/IrcConnection"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/GameAnimationLoop", ["network/IrcConnection"], function (e, t) {
  "use strict";
  var a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "GameAnimationLoop",
        (i = class {
          constructor(e, t, i, r, s = {}) {
            ((this.localPlayer = e),
              (this.renderer = t),
              (this.sound = i),
              (this.gameTurnMgr = r),
              (this.options = s),
              (this.isStarted = !1),
              (this.rendererErrorState = !1),
              (this.doBackgroundFrame = (t) => {
                if (this.isStarted && this.paused) {
                  let e = this.updateDeltaGameFrames(t);
                  for (this.turnMgrIsWaiting && (e = 1); 0 < e;)
                    ((this.turnMgrIsWaiting = !1 === this.tickGame(t)), e--);
                }
              }),
              (this.doFrame = (i) => {
                if (this.isStarted && !this.paused) {
                  let t = this.updateDeltaGameFrames(i);
                  (this.turnMgrIsWaiting || (!this.options.skipFrames && 1 < t)) && (t = 1);
                  let e = this.renderer.getStats();
                  if ((e && e.begin(), this.options.skipBudgetMillis)) {
                    let e = this.options.skipBudgetMillis;
                    for (; 0 < t;) {
                      var r = performance.now();
                      ((this.turnMgrIsWaiting = !1 === this.tickGame(i)), t--);
                      r = performance.now() - r;
                      if (((e = Math.max(0, e - r)), e <= 0)) break;
                    }
                  } else for (; 0 < t;) ((this.turnMgrIsWaiting = !1 === this.tickGame(i)), t--);
                  var s = this.gameTurnMgr.getTurnMillis(),
                    s = Math.max(0, (i - (this.startTime + this.lastGameFrame * s)) / s);
                  (this.updateRenderer(i, s),
                    this.render() && (e && e.end(), (this.rafId = requestAnimationFrame(this.doFrame))));
                }
              }),
              (this.handleVisibilityChange = () => {
                var e = document.hidden;
                if (this.paused !== e) {
                  if (
                    (this.localPlayer &&
                      !this.localPlayer.isObserver &&
                      this.paused &&
                      this.doBackgroundFrame(performance.now()),
                    (this.paused = e) || ((this.startTime = void 0), (this.lastGameFrame = 0)),
                    this.localPlayer && !this.localPlayer.isObserver)
                  )
                    try {
                      this.gameTurnMgr.setPassiveMode?.(this.paused);
                    } catch (e) {
                      if (!(e instanceof a.IrcConnection.SocketError)) throw e;
                    }
                  (this.paused
                    ? (this.rafId && (cancelAnimationFrame(this.rafId), (this.rafId = void 0)),
                      (this.backgroundIntervalId = setInterval(() => {
                        var e = performance.now();
                        this.doBackgroundFrame(e);
                      }, 1e3)))
                    : (this.backgroundIntervalId &&
                        (clearInterval(this.backgroundIntervalId), (this.backgroundIntervalId = void 0)),
                      (this.rafId = requestAnimationFrame(this.doFrame))),
                    this.sound.audioSystem.setMuted(this.paused));
                }
              }));
          }
          start() {
            this.isStarted ||
              ((this.isStarted = !0),
              (this.paused = !1),
              (this.startTime = void 0),
              (this.lastGameFrame = 0),
              document.hidden ? this.handleVisibilityChange() : (this.rafId = requestAnimationFrame(this.doFrame)),
              document.addEventListener("visibilitychange", this.handleVisibilityChange));
          }
          updateDeltaGameFrames(e) {
            var t = this.gameTurnMgr.getTurnMillis(),
              i = t !== this.lastGameTurnMillis;
            ((this.lastGameTurnMillis = t), i && ((this.lastGameFrame = 0), (this.startTime = e)));
            let r = 0;
            return (
              this.startTime
                ? ((i = e - this.startTime),
                  (t = Math.round(i / t)),
                  (r = t - this.lastGameFrame),
                  (this.lastGameFrame = t))
                : (this.startTime = e),
              r
            );
          }
          tickGame(e) {
            if (!this.options.onError) return this.gameTurnMgr.doGameTurn(e);
            try {
              return this.gameTurnMgr.doGameTurn(e);
            } catch (e) {
              return (this.gameTurnMgr.setErrorState(), void this.options.onError(e));
            }
          }
          updateRenderer(e, t) {
            if (this.options.onError) {
              if (!this.rendererErrorState)
                try {
                  this.renderer.update(e, t);
                } catch (e) {
                  return (
                    this.gameTurnMgr.setErrorState(),
                    (this.rendererErrorState = !0),
                    void this.options.onError(e)
                  );
                }
            } else this.renderer.update(e, t);
          }
          render() {
            if (this.options.onError)
              try {
                this.renderer.render();
              } catch (e) {
                return (
                  this.gameTurnMgr.setErrorState(),
                  (this.rendererErrorState = !0),
                  this.options.onError(e, !0),
                  !1
                );
              }
            else this.renderer.render();
            return !0;
          }
          stop() {
            this.isStarted &&
              ((this.isStarted = !1),
              this.rafId && (cancelAnimationFrame(this.rafId), (this.rafId = void 0)),
              this.backgroundIntervalId &&
                (clearInterval(this.backgroundIntervalId), (this.backgroundIntervalId = void 0)),
              document.removeEventListener("visibilitychange", this.handleVisibilityChange));
          }
          destroy() {
            (this.stop(), this.renderer.flush());
          }
        }),
      );
    },
  };
});
