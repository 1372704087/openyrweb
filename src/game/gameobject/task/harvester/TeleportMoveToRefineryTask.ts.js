// === Reconstructed SystemJS module: game/gameobject/task/harvester/TeleportMoveToRefineryTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/type/LocomotorType","game/gameobject/trait/MoveTrait","game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/harvester/TeleportMoveToRefineryTask",
  [
    "game/gameobject/task/move/MoveTask",
    "game/type/LocomotorType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/unit/ZoneType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
      ],
      execute: function () {
        ((n = class extends i.MoveTask {
          constructor(e, t, i, r) {
            (super(e, i ?? t, !1, { closeEnoughTiles: i ? void 0 : 0, strictCloseEnough: !i }),
              (this.teleportTile = t),
              (this.teleportCondition = r));
          }
          onStart(e) {
            if ((super.onStart(e), !e.harvesterTrait || e.rules.locomotor !== r.LocomotorType.Chrono))
              throw new Error(`Vehicle ${e.name} is not a chrono miner`);
          }
          onTick(e) {
            return (
              !e.moveTrait.isDisabled() &&
              (!(
                this.isCancelling() ||
                e.moveTrait.moveState !== s.MoveState.ReachedNextWaypoint ||
                e.tile === this.teleportTile ||
                !this.tryTeleportToRefinery(e)
              ) ||
                (!0 === super.onTick(e) &&
                  (this.isCancelling() || e.tile === this.teleportTile || this.tryTeleportToRefinery(e), !0)))
            );
          }
          tryTeleportToRefinery(e) {
            return (
              (!this.teleportCondition || !1 !== this.teleportCondition(e, this.teleportTile)) &&
              !this.game.map.terrain.findObstacles({ tile: this.teleportTile, onBridge: void 0 }, e).length &&
              (e.moveTrait.teleportUnitToTile(this.teleportTile, void 0, !0, !0, this.game),
              e.zone === a.ZoneType.Air && ((e.zone = a.ZoneType.Ground), (e.position.tileElevation = 0)),
              !0)
            );
          }
        }),
          e("TeleportMoveToRefineryTask", n));
      },
    };
  },
);
