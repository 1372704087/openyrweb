// === Reconstructed SystemJS module: game/gameobject/task/EnterRecyclerTask ===
// deps: ["game/gameobject/Building","game/type/LocomotorType","game/type/MovementZone","game/event/UnitRecycleEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EnterRecyclerTask",
  [
    "game/gameobject/Building",
    "game/type/LocomotorType",
    "game/type/MovementZone",
    "game/event/UnitRecycleEvent",
    "game/gameobject/task/EnterBuildingTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        ((o = class extends n.EnterBuildingTask {
          isAllowed(e) {
            return (
              e.rules.movementZone !== s.MovementZone.Fly &&
              e.rules.locomotor !== r.LocomotorType.Chrono &&
              !e.rules.engineer &&
              0 < this.game.sellTrait.computeRefundValue(e) &&
              ((e.isInfantry() && this.target.rules.cloning) || this.target.rules.grinding) &&
              !this.target.isDestroyed &&
              this.target.buildStatus === i.BuildStatus.Ready &&
              e.owner === this.target.owner
            );
          }
          onEnter(e) {
            (this.game.sellTrait.sell(e), this.game.events.dispatch(new a.UnitRecycleEvent(e)));
          }
        }),
          e("EnterRecyclerTask", o));
      },
    };
  },
);
