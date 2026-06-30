// === Reconstructed SystemJS module: game/CountdownTimer ===
// deps: ["game/event/TimerExpireEvent","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/CountdownTimer", ["game/event/TimerExpireEvent", "game/GameSpeed"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "CountdownTimer",
        (s = class {
          constructor() {
            ((this.ticks = 0), (this.running = !1));
          }
          getSeconds() {
            return Math.floor(this.ticks / r.GameSpeed.BASE_TICKS_PER_SECOND);
          }
          setSeconds(e) {
            this.ticks = Math.max(0, Math.floor(r.GameSpeed.BASE_TICKS_PER_SECOND * e));
          }
          addSeconds(e) {
            this.ticks = Math.max(0, this.ticks + Math.floor(r.GameSpeed.BASE_TICKS_PER_SECOND * e));
          }
          start() {
            this.running = !0;
          }
          stop() {
            this.running = !1;
          }
          isRunning() {
            return this.running;
          }
          update(e) {
            this.running &&
              (0 < this.ticks ? this.ticks-- : ((this.running = !1), e.events.dispatch(new i.TimerExpireEvent(this))));
          }
        }),
      );
    },
  };
});
