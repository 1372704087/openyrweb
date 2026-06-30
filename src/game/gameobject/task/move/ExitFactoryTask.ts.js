// === Reconstructed SystemJS module: game/gameobject/task/move/ExitFactoryTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/trait/MoveTrait","game/rules/TechnoRules","game/gameobject/task/ScatterTask","game/gameobject/task/AttackTask","game/gameobject/task/move/AttackMoveTargetTask","game/gameobject/task/move/AttackMoveTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/ExitFactoryTask",
  [
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/trait/MoveTrait",
    "game/rules/TechnoRules",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/task/AttackTask",
    "game/gameobject/task/move/AttackMoveTargetTask",
    "game/gameobject/task/move/AttackMoveTask",
  ],
  function (e, t) {
    "use strict";
    var s, a, n, o, l, c, h, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
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
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((i = class extends s.MoveTask {
          constructor(e, t, i, r) {
            (super(e, i, !1, {
              ignoredBlockers: [t],
              closeEnoughTiles: 0,
              strictCloseEnough: !0,
              forceWaitOnPathBlocked: t.factoryTrait?.type !== n.FactoryType.InfantryType,
            }),
              (this.factory = t),
              (this.rallyPoint = r),
              (this.preventOpportunityFire = !0),
              (this.rampBlockersPushed = !1),
              (this.cancellable = !1));
          }
          onStart(t) {
            (super.onStart(t),
              this.factory.factoryTrait?.type === n.FactoryType.UnitType &&
                (this.checkRampTiles = this.game.map.tileOccupation
                  .calculateTilesForGameObject(this.factory.tile, this.factory)
                  .filter(
                    (e) => 0 < this.game.map.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !1),
                  )));
          }
          canStopAtTile(e, t, i) {
            return !this.game.map.tileOccupation.isTileOccupiedBy(t, this.factory) && super.canStopAtTile(e, t, i);
          }
          onTick(e) {
            // OpenYRWeb: anti-stall. If a vehicle cannot clear the factory for a while (e.g.
            // surrounding buildings permanently block the direct path to the rally point and
            // forceWaitOnPathBlocked keeps it waiting inside forever), give up on the strict
            // wait and let MoveTask repath. The factory-building blocker is still ignored
            // (ignoredBlockers), so the unit can drive over the factory foundation to exit,
            // then path normally to the rally point. Without this, a tightly-packed base leaves
            // produced vehicles stuck inside the war factory indefinitely.
            if (
              (this.stallTicks = (this.stallTicks ?? 0) + 1) > 90 &&
              this.options?.forceWaitOnPathBlocked
            ) {
              (this.options.forceWaitOnPathBlocked = !1),
                (this.stallTicks = void 0),
                this.game && this.log && this.log(e, "exit_factory_repath_after_stall");
            }
            if (this.checkRampTiles) {
              for (var t of this.checkRampTiles) {
                var i, r;
                for (i of this.game.map.tileOccupation.getGroundObjectsOnTile(t))
                  if (i.isUnit()) {
                    if (this.rampBlockersPushed) return !1;
                    let e = new o.ScatterTask(this.game, void 0, { excludedTiles: this.checkRampTiles });
                    e.setCancellable(!1);
                    let t = i.unitOrderTrait.getCurrentTask();
                    t
                      ? (t.constructor !== s.MoveTask &&
                          t.constructor !== l.AttackTask &&
                          t.constructor !== h.AttackMoveTask &&
                          t.constructor !== c.AttackMoveTargetTask) ||
                        ((r = t.duplicate()),
                        t.cancel(),
                        i.unitOrderTrait.addTaskNext(r),
                        i.unitOrderTrait.addTaskNext(e))
                      : i.unitOrderTrait.addTask(e);
                  }
              }
              if (!this.rampBlockersPushed) return !(this.rampBlockersPushed = !0);
              this.checkRampTiles = void 0;
            }
            return (
              e.moveTrait.moveState === a.MoveState.ReachedNextWaypoint &&
                this.options?.ignoredBlockers &&
                !this.game.map.terrain.isBlockerObject(this.factory, e.tile, !1, e.rules.speedType, e.isInfantry()) &&
                ((this.options.ignoredBlockers = void 0),
                (this.preventOpportunityFire = !1),
                this.rallyPoint &&
                  (this.updateTarget(this.rallyPoint.tile, !!this.rallyPoint.onBridge),
                  (this.cancellable = !0),
                  (this.options.closeEnoughTiles = this.game.rules.general.closeEnough),
                  (this.options.strictCloseEnough = !1),
                  (this.options.forceWaitOnPathBlocked = !1))),
              super.onTick(e)
            );
          }
        }),
          e("ExitFactoryTask", i));
      },
    };
  },
);
