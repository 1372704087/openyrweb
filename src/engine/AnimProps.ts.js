// === Reconstructed SystemJS module: engine/AnimProps ===
// deps: ["game/GameSpeed","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/AnimProps", ["game/GameSpeed", "util/math"], function (e, t) {
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
      (e(
        "AnimProps",
        (s = class s {
          constructor(e, t) {
            ((this.art = e), this.init(t));
          }
          init(e) {
            ((this.shadow = this.art.getBool("Shadow")),
              (this.reverse = this.art.getBool("Reverse")),
              (this.frameCount = "number" == typeof e ? e : this.shadow ? e.numImages / 2 : e.numImages),
              (this.end = this.art.getNumber("End", this.frameCount - 1)));
            var t = this.art.getNumberArray("RandomRate").sort();
            (2 === t.length
              ? (this.rate = r.getRandomInt(t[0], t[1]) / 60)
              : (this.rate = this.art.getNumber("Rate", 60 * s.defaultRate) / 60),
              (this.start = this.art.getNumber("Start", 0)),
              (this.loopStart = this.art.getNumber("LoopStart", 0)),
              (this.loopEnd = Math.max(this.loopStart, this.art.getNumber("LoopEnd", this.end + 1) - 1)),
              (this.loopCount = this.art.getNumber("LoopCount", 1)));
            t = this.art.getNumberArray("RandomLoopDelay").sort();
            this.randomLoopDelay = 2 === t.length ? [t[0], t[1]] : void 0;
          }
          getArt() {
            return this.art;
          }
          setArt(e) {
            ((this.art = e), this.init(this.frameCount));
          }
        }),
      ),
        (s.defaultRate = i.GameSpeed.BASE_TICKS_PER_SECOND));
    },
  };
});
