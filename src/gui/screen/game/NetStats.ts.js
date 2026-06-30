// === Reconstructed SystemJS module: gui/screen/game/NetStats ===
// deps: ["stats.js","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/NetStats", ["stats.js", "util/disposable/CompositeDisposable"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "NetStats",
        (i = class {
          constructor(e, t, i, r) {
            ((this.lockstep = e),
              (this.player = t),
              (this.renderer = i),
              (this.pingMonitor = r),
              (this.disposables = new a.CompositeDisposable()));
          }
          init() {
            let e = this.renderer.getStats(),
              t = new s.default.Panel("ms RTT", "#ff8", "#221"),
              i = 250,
              r = (e) => {
                requestAnimationFrame(() => t.update(e, i));
              };
            if (
              (this.pingMonitor.onNewSample.subscribe(r),
              this.disposables.add(() => {
                this.pingMonitor.onNewSample.unsubscribe(r);
                let e = this.renderer.getStats();
                e && t.dom && e.dom.removeChild(t.dom);
              }),
              e.addPanel(t),
              !this.player.isObserver)
            ) {
              let i = new s.default.Panel("ms LAT", "#f8f", "#212"),
                r = new Map();
              (this.lockstep.onActionsSent.subscribe((e) => {
                r.set(e, performance.now());
              }),
                this.lockstep.onActionsReceived.subscribe((t) => {
                  if (r.has(t)) {
                    let e = performance.now() - r.get(t);
                    (r.delete(t), requestAnimationFrame(() => i.update(e, 1e3)));
                  }
                }),
                e.addPanel(i),
                this.disposables.add(() => {
                  let e = this.renderer.getStats();
                  e && i.dom && e.dom.removeChild(i.dom);
                }));
            }
          }
          dispose() {
            this.disposables.dispose();
          }
        }),
      );
    },
  };
});
