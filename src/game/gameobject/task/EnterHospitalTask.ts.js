// === Reconstructed SystemJS module: game/gameobject/task/EnterHospitalTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveOutsideTask","game/gameobject/task/move/MoveInsideTask","game/type/MovementZone","game/gameobject/unit/MovePositionHelper","game/map/tileFinder/RadialTileFinder","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/gameobject/trait/MoveTrait","game/event/EnterObjectEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EnterHospitalTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveOutsideTask",
    "game/gameobject/task/move/MoveInsideTask",
    "game/type/MovementZone",
    "game/gameobject/unit/MovePositionHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/MoveTrait",
    "game/event/EnterObjectEvent",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g;
    e && e.id;
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
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        var e;
        (((e = d = d || {})[(e.MoveToQueueingTile = 0)] = "MoveToQueueingTile"),
          (e[(e.WaitForTurn = 1)] = "WaitForTurn"),
          (e[(e.MoveToTarget = 2)] = "MoveToTarget"),
          (e[(e.EnterTarget = 3)] = "EnterTarget"),
          (e[(e.ClearTarget = 4)] = "ClearTarget"),
          (g = class extends i.Task {
            constructor(e, t) {
              (super(), (this.game = e), (this.target = t), (this.movePerformed = !1));
            }
            isAllowed(e) {
              return (
                e.rules.movementZone !== a.MovementZone.Fly &&
                e.healthTrait.health < 100 &&
                this.target.hospitalTrait &&
                !this.target.isDestroyed &&
                !this.target.warpedOutTrait.isActive() &&
                this.game.areFriendly(e, this.target) &&
                (!this.target.ammoTrait || 0 < this.target.ammoTrait.ammo)
              );
            }
            onStart(e) {
              if (!this.target.hospitalTrait) throw new Error(`Target ${this.target.name} is not a valid hospital`);
              0 < this.target.hospitalTrait.addToHealQueue(e)
                ? (this.state = d.MoveToQueueingTile)
                : (this.state = d.MoveToTarget);
            }
            onEnd(e) {
              !this.target.isDestroyed && e.isSpawned && this.target.hospitalTrait.removeFromHealQueue(e);
            }
            onTick(i) {
              if (
                (this.isCancelling() && this.state !== d.EnterTarget) ||
                this.state === d.ClearTarget ||
                i.moveTrait.isDisabled()
              )
                return !0;
              if (this.state === d.MoveToQueueingTile) {
                let t = new n.MovePositionHelper(this.game.map);
                var e = new o.RadialTileFinder(
                  this.game.map.tiles,
                  this.game.map.mapBounds,
                  this.target.tile,
                  this.target.getFoundation(),
                  1,
                  1,
                  (e) =>
                    0 < this.game.map.terrain.getPassableSpeed(e, i.rules.speedType, i.isInfantry(), !1) &&
                    t.isEligibleTile(e, void 0, void 0, this.target.tile),
                ).getNextTile();
                return (
                  !e ||
                  (this.children.push(new l.MoveTask(this.game, e, !1, { closeEnoughTiles: 5 })),
                  this.children.push(
                    new c.CallbackTask(() => {
                      [h.MoveResult.Success, h.MoveResult.CloseEnough].includes(i.moveTrait.lastMoveResult) ||
                        this.cancel();
                    }),
                  ),
                  (this.state = d.WaitForTurn),
                  (this.queueingTile = e),
                  !1)
                );
              }
              if (this.state === d.WaitForTurn) {
                if (!this.target.hospitalTrait.unitIsFirstInHealQueue(i)) return !1;
                ((this.queueingTile = void 0), (this.state = d.MoveToTarget));
              }
              if (this.state === d.MoveToTarget) {
                if (this.movePerformed && this.children.length)
                  return (
                    i.tile === this.lastOutsideTile ||
                      this.game.map.tileOccupation.isTileOccupiedBy(i.tile, this.target) ||
                      (this.lastOutsideTile = i.tile),
                    !1
                  );
                if (!this.isAllowed(i)) return !0;
                if (!this.game.map.tileOccupation.isTileOccupiedBy(i.tile, this.target))
                  return (
                    !!this.movePerformed ||
                    (this.children.push(new s.MoveInsideTask(this.game, this.target).setBlocking(!1)),
                    !(this.movePerformed = !0))
                  );
                this.state = d.EnterTarget;
              }
              return (
                this.state === d.EnterTarget &&
                (!this.isAllowed(i) || this.isCancelling()
                  ? (this.children.push(new r.MoveOutsideTask(this.game, this.target, this.lastOutsideTile)),
                    (this.state = d.ClearTarget),
                    !1)
                  : (this.game.limboObject(i, {
                      selected: !1,
                      controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(i).getControlGroupNumber(),
                    }),
                    this.target.hospitalTrait.startHealing(i),
                    this.game.events.dispatch(new u.EnterObjectEvent(this.target, i)),
                    !0))
              );
            }
            getTargetLinesConfig(e) {
              return {
                target: this.queueingTile ? void 0 : this.target,
                pathNodes: this.queueingTile ? [{ tile: this.queueingTile, onBridge: void 0 }] : [],
              };
            }
          }),
          t("EnterHospitalTask", g));
      },
    };
  },
);
