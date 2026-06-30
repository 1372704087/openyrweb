// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MenuMpSlotAnimRunner ===
// deps: ["gui/screen/mainMenu/component/MenuSlotAnimationRunner","engine/Animation"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/component/MenuMpSlotAnimRunner",
  ["gui/screen/mainMenu/component/MenuSlotAnimationRunner", "engine/Animation"],
  function (e, t) {
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
        ((s = class extends i.MenuSlotAnimationRunner {
          getCurrentFrame() {
            if (
              this.currentAnimationType === i.AnimationType.None ||
              this.animation.getState() === r.AnimationState.DELAYED
            )
              return this.collapsed ? 6 : 0;
            {
              var t = this.currentAnimationType === i.AnimationType.SlideIn ? -1 : 1;
              let e = 1;
              return (-1 == t && (e += 5), e + t * this.animation.getCurrentFrame());
            }
          }
        }),
          e("MenuMpSlotAnimRunner", s));
      },
    };
  },
);
