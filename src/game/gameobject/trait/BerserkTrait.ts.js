// === Reconstructed SystemJS module: game/gameobject/trait/BerserkTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifyUnspawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/BerserkTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifyUnspawn",
  ],
  function (e, t) {
    "use strict";
    var i, r, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        var s;
        e(
          "BerserkTrait",
          (s = class {
            constructor(e) {
              ((this.gameObject = e), (this.berserkFrames = 0), (this.berserkSource = void 0));
            }
            isBerserk() {
              return 0 < this.berserkFrames;
            }
            getBerserkFrames() {
              return this.berserkFrames;
            }
            // Apply berserk for the given number of frames. If already berserk,
            // the larger of the current and new duration wins (vanilla YR behavior).
            // When berserk is first applied (was not berserk), cancel all current orders
            // so the unit immediately stops attacking and re-scans for nearby friendlies.
            setBerserk(e, t) {
              if (e > this.berserkFrames) {
                var r = 0 < this.berserkFrames;
                (this.berserkFrames = e), (this.berserkSource = t);
                r || this.gameObject.unitOrderTrait?.cancelAllTasks();
              }
            }
            clearBerserk() {
              (this.berserkFrames = 0), (this.berserkSource = void 0);
            }
            [i.NotifyTick.onTick]() {
              0 < this.berserkFrames && this.berserkFrames--;
            }
            [r.NotifyOwnerChange.onChange]() {
              this.berserkFrames = 0;
            }
            [n.NotifyUnspawn.onUnspawn]() {
              (this.berserkFrames = 0), (this.berserkSource = void 0);
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
        );
      },
    };
  },
);
