// === Reconstructed SystemJS module: game/gameobject/task/PlantC4Task ===
// deps: ["game/GameSpeed","game/event/EnterObjectEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/PlantC4Task",
  ["game/GameSpeed", "game/event/EnterObjectEvent", "game/gameobject/task/EnterBuildingTask"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
          s = e;
        },
      ],
      execute: function () {
        ((a = class extends s.EnterBuildingTask {
          isAllowed(e) {
            return !this.target.isDestroyed && !this.target.invulnerableTrait.isActive();
          }
          onEnter(e) {
            var t = Math.floor(60 * this.game.rules.combatDamage.c4Delay * i.GameSpeed.BASE_TICKS_PER_SECOND);
            return (
              this.target.c4ChargeTrait.setCharge(t, { player: e.owner, obj: e }),
              this.game.events.dispatch(new r.EnterObjectEvent(this.target, e)),
              !1
            );
          }
          getTargetLinesConfig(e) {
            return { target: this.target, pathNodes: [], isAttack: !0 };
          }
        }),
          e("PlantC4Task", a));
      },
    };
  },
);
