// === Reconstructed SystemJS module: game/gameobject/task/EnterTankBunkerTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveTask","game/gameobject/task/TurnTask","game/Coords","game/math/Vector2"]
//
// OpenYRWeb: Vehicle enters a Tank Bunker — drives to the building center,
// turns to face the bunker's orientation, then docks to be absorbed.

System.register(
  "game/gameobject/task/EnterTankBunkerTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/TurnTask",
    "game/Coords",
    "game/math/Vector2",
  ],
  function (e, t) {
    "use strict";
    var i, s, T, n, V2, o;
    t && t.id;
    return {
      setters: [
        function (e) { i = e; },
        function (e) { s = e; },
        function (e) { T = e; },
        function (e) { n = e; },
        function (e) { V2 = e; },
      ],
      execute: function () {
        e(
          "EnterTankBunkerTask",
          (o = class extends i.Task {
            constructor(e, t) {
              (super(),
                (this.game = e),
                (this.target = t),
                (this.preventOpportunityFire = !1));
            }
            onStart(e) {
              // Entry tile: top-right corner of foundation (passable for vehicles).
              var f = this.target.getFoundation();
              var entryRx = this.target.tile.rx + f.width - 1;
              var entryRy = this.target.tile.ry;
              var entryTile = this.game.map.tiles.getByMapCoords(entryRx, entryRy);
              if (!entryTile) { this.cancel(); return; }
              // targetOffset: offset from entry tile origin to building center
              var bc = this.target.position.getMapPosition();
              var targetOffset = new V2.Vector2(
                bc.x - entryRx * n.Coords.LEPTONS_PER_TILE,
                bc.y - entryRy * n.Coords.LEPTONS_PER_TILE,
              );
              this.children.push(
                new s.MoveTask(this.game, entryTile, !1, {
                  ignoredBlockers: [this.target],
                  targetOffset: targetOffset,
                  closeEnoughTiles: Math.SQRT2 / 2,
                  strictCloseEnough: !0,
                }),
              );
            }
            onTick(e) {
              if (this.isCancelling()) return !0;
              if (!this.target.isSpawned || this.target.isDestroyed) return !0;
              // Phase 1: wait for MoveTask to complete
              if (this.children.length > 0) return !1;
              // Phase 2: turn hull to face 180°
              if (!this._turned) {
                this._turned = !0;
                this.children.push(new T.TurnTask(180));
                return !1;
              }
              // Phase 2a: wait one tick for hull visual rotation to settle
              if (!this._settled) {
                this._settled = !0;
                return !1;
              }
              // Phase 3: smooth turret rotation to align with hull ("回正")
              if (!this._turretTurning) {
                this._turretTurning = !0;
                if (e.turretTrait) {
                  e.turretTrait.desiredFacing = 180;
                }
                return !1;
              }
              // Wait for turret rotation to complete
              if (e.turretTrait && e.turretTrait.isRotating()) {
                return !1;
              }
              // Phase 4: register vehicle directly in TankBunkerTrait (bypass DockTrait)
              // DockTrait would undock every tick because the vehicle is at building center,
              // not at the dock tile. TankBunkerTrait owns the bunkered state independently.
              var tbTrait = this.target.tankBunkerTrait;
              if (tbTrait) {
                tbTrait.bunkeredVehicle = e;
                tbTrait._prevDockedCount = 1;
                e.bunkeredAt = this.target;
                // Disable movement and cancel any pending orders/tasks
                if (e.moveTrait) {
                  e.moveTrait.setDisabled(!0);
                }
                if (e.unitOrderTrait) {
                  e.unitOrderTrait.clearOrders();
                  e.unitOrderTrait.cancelAllTasks();
                }
              }
              return !0;
            }
            isValidTarget(e, t) {
              return e.isSpawned && this.game.areFriendly(e, t);
            }
          }),
        );
      },
    };
  },
);
