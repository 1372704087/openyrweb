// === Reconstructed SystemJS module: engine/renderable/entity/HighlightAnimRunner ===
// deps: ["engine/animation/SimpleRunner","engine/Animation","engine/AnimProps","data/IniSection","data/ShpFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/HighlightAnimRunner",
  ["engine/animation/SimpleRunner", "engine/Animation", "engine/AnimProps", "data/IniSection", "data/ShpFile"],
  function (e, t) {
    "use strict";
    var i, a, n, o, l, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
      ],
      execute: function () {
        ((r = class extends i.SimpleRunner {
          constructor(e, t = 0.5, i = 2, r = 5) {
            (super(), (this.maxAmount = t));
            let s = new n.AnimProps(new o.IniSection("dummy"), new l.ShpFile());
            ((s.rate = r),
              (s.loopEnd = i - 1),
              (s.loopCount = 2),
              (this.animation = new a.Animation(s, e)),
              this.animation.stop());
          }
          animate(e) {
            ((this.animation.props.loopCount = e), this.animation.reset());
          }
          getValue() {
            return (1 - this.getCurrentFrame()) * this.maxAmount;
          }
        }),
          e("HighlightAnimRunner", r));
      },
    };
  },
);
