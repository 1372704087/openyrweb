// === Reconstructed SystemJS module: engine/renderable/entity/InvulnerableAnimRunner ===
// deps: ["engine/animation/SimpleRunner","engine/Animation","engine/AnimProps","data/IniSection","data/ShpFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/InvulnerableAnimRunner",
  ["engine/animation/SimpleRunner", "engine/Animation", "engine/AnimProps", "data/IniSection", "data/ShpFile"],
  function (e, t) {
    "use strict";
    var i, n, o, l, c, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
        ((r = class extends i.SimpleRunner {
          constructor(e, t = -0.75, i = -0.5, r = 10, s = 10) {
            (super(), (this.minAmount = t), (this.maxAmount = i), (this.steps = r));
            let a = new o.AnimProps(new l.IniSection("dummy"), new c.ShpFile());
            ((a.rate = s),
              (a.loopEnd = r),
              (a.loopCount = -1),
              (this.animation = new n.Animation(a, e)),
              this.animation.stop());
          }
          animate() {
            this.animation.reset();
          }
          getValue() {
            return (
              this.minAmount +
              ((1 + Math.sin((2 * Math.PI * this.getCurrentFrame()) / this.steps)) / 2) *
                (this.maxAmount - this.minAmount)
            );
          }
        }),
          e("InvulnerableAnimRunner", r));
      },
    };
  },
);
