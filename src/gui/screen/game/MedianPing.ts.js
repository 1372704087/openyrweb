// === Reconstructed SystemJS module: gui/screen/game/MedianPing ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/MedianPing", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MedianPing",
        (i = class {
          constructor(e = 100) {
            ((this.reservoirSize = e), (this.reservoir = []), (this.totalSamples = 0));
          }
          pushSample(e) {
            var t;
            (this.totalSamples++,
              this.reservoir.length < this.reservoirSize
                ? this.reservoir.push(e)
                : (t = Math.floor(Math.random() * this.totalSamples)) < this.reservoirSize && (this.reservoir[t] = e));
          }
          calculate() {
            if (0 !== this.reservoir.length) {
              var e = [...this.reservoir].sort((e, t) => e - t),
                t = Math.floor(e.length / 2);
              return e.length % 2 == 1 ? e[t] : (e[t - 1] + e[t]) / 2;
            }
          }
        }),
      );
    },
  };
});
