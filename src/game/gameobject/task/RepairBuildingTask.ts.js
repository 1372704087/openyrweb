// === Reconstructed SystemJS module: game/gameobject/task/RepairBuildingTask ===
// deps: ["game/event/BuildingRepairFullEvent","game/event/BridgeRepairEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/RepairBuildingTask",
  ["game/event/BuildingRepairFullEvent", "game/event/BridgeRepairEvent", "game/gameobject/task/EnterBuildingTask"],
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
            return this.target.cabHutTrait
              ? this.target.cabHutTrait.canRepairBridge()
              : e.rules.engineer &&
                  !this.target.isDestroyed &&
                  this.target.rules.repairable &&
                  this.target.healthTrait.health < 100 &&
                  ((!this.target.owner.isCombatant() && !!this.target.garrisonTrait) ||
                    this.game.areFriendly(e, this.target));
          }
          onEnter(e) {
            (this.game.unspawnObject(e),
              this.target.cabHutTrait
                ? (this.target.cabHutTrait.repairBridge(this.game, e.owner),
                  this.game.events.dispatch(new r.BridgeRepairEvent(e.owner, this.target.centerTile)))
                : (this.target.healthTrait.healToFull(e, this.game),
                  this.game.events.dispatch(new i.BuildingRepairFullEvent(this.target, e.owner))));
          }
        }),
          e("RepairBuildingTask", a));
      },
    };
  },
);
