// === Reconstructed SystemJS module: gui/screen/game/TauntHandler ===
// deps: ["util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/TauntHandler", ["util/disposable/CompositeDisposable"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "TauntHandler",
        (i = class {
          constructor(e, t, i, r, s, a, n) {
            ((this.gservCon = e),
              (this.localPlayer = t),
              (this.game = i),
              (this.replayRecorder = r),
              (this.tauntsEnabled = s),
              (this.tauntPlayback = a),
              (this.mutedPlayers = n),
              (this.lastTauntTimeByPlayer = new Map()),
              (this.disposables = new o.CompositeDisposable()),
              (this.handleMessage = (e) => {
                var t;
                !this.tauntsEnabled.value ||
                  ((t = this.game.getPlayerByName(e.from)).country &&
                    (this.mutedPlayers.has(t.name) ||
                      (this.checkAndUpdateLastTauntTime(t.name) &&
                        (this.recordReplayEvent(t, e.tauntNo),
                        this.tauntPlayback.playTaunt(t, e.tauntNo).catch((e) => console.error(e))))));
              }));
          }
          init() {
            (this.gservCon.onTaunt.subscribe(this.handleMessage),
              this.disposables.add(() => this.gservCon.onTaunt.unsubscribe(this.handleMessage)));
          }
          sendTaunt(e) {
            this.checkAndUpdateLastTauntTime(this.localPlayer.name) &&
              this.gservCon.isOpen() &&
              (this.gservCon.sendTaunt(e),
              this.recordReplayEvent(this.localPlayer, e),
              this.tauntPlayback.playTaunt(this.localPlayer, e).catch((e) => console.error(e)));
          }
          checkAndUpdateLastTauntTime(e) {
            var t = Date.now(),
              i = this.lastTauntTimeByPlayer.get(e);
            return !(i && t - i <= 5e3) && (this.lastTauntTimeByPlayer.set(e, t), !0);
          }
          recordReplayEvent(e, t) {
            this.replayRecorder.recordTaunt(this.game.currentTick, e.name, t);
          }
          dispose() {
            this.disposables.dispose();
          }
        }),
      );
    },
  };
});
