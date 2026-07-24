// === Reconstructed SystemJS module: game/order/MoveOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/morph/UndeployIntoTask","game/gameobject/task/move/MoveTask","game/order/OrderFeedbackType","game/event/RallyPointChangeEvent","game/type/MovementZone","game/type/SpeedType","game/gameobject/task/AttackTask","game/gameobject/Building","game/gameobject/task/WaitForBuildUpTask","game/gameobject/task/move/MoveToBlockTask","game/type/LandType","game/gameobject/task/move/AttackMoveTask","game/gameobject/task/move/AttackMoveTargetTask","game/gameobject/task/move/MoveTargetTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/MoveOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/morph/UndeployIntoTask",
    "game/gameobject/task/move/MoveTask",
    "game/order/OrderFeedbackType",
    "game/event/RallyPointChangeEvent",
    "game/type/MovementZone",
    "game/type/SpeedType",
    "game/gameobject/task/AttackTask",
    "game/gameobject/Building",
    "game/gameobject/task/WaitForBuildUpTask",
    "game/gameobject/task/move/MoveToBlockTask",
    "game/type/LandType",
    "game/gameobject/task/move/AttackMoveTask",
    "game/gameobject/task/move/AttackMoveTargetTask",
    "game/gameobject/task/move/MoveTargetTask",
  ],
  function (e, t) {
    "use strict";
    var i, s, o, r, a, n, l, c, h, u, d, g, p, m, f, y, T, v;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
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
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
      ],
      execute: function () {
        ((v = class extends i.Order {
          constructor(e, t, i, r = !1) {
            (super(r ? s.OrderType.ForceMove : s.OrderType.Move),
              (this.game = e),
              (this.map = t),
              (this.unitSelection = i),
              (this.forceMove = r),
              (this.targetOptional = !1),
              (this.feedbackType = n.OrderFeedbackType.Move));
          }
          getPointerType(e) {
            let t = this.isAllowed();
            // OpenYRWeb: bunkered vehicles show default arrow cursor instead of NoMove/NoAction
            if (!t && this.sourceObject.bunkeredAt) {
              return o.PointerType.Default;
            }
            var i, r, s, a, n;
            return (
              !t ||
                this.forceMove ||
                this.sourceObject.isBuilding() ||
                this.game.mapShroudTrait
                  .getPlayerShroud(this.sourceObject.owner)
                  ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) ||
                ((i = !!this.target.getBridge()),
                (r = this.sourceObject.rules.speedType),
                (s = this.sourceObject.isInfantry()),
                (a = this.sourceObject.rules.movementZone === c.MovementZone.Fly),
                (n = this.map
                  .getObjectsOnTile(this.target.tile)
                  .some((e) => (e.isInfantry() || e.isVehicle()) && e.disguiseTrait?.hasTerrainDisguise())),
                (t = a
                  ? this.sourceObject.rules.airportBound ||
                    this.target.tile.landType === m.LandType.Cliff ||
                    (0 < this.map.terrain.getPassableSpeed(this.target.tile, h.SpeedType.Amphibious, !1, i) && !n)
                  : 0 < this.map.terrain.getPassableSpeed(this.target.tile, r, s, i) &&
                    !n &&
                    !(this.target.obj?.isTechno() && !this.game.areFriendly(this.target.obj, this.sourceObject)))),
              e
                ? t
                  ? o.PointerType.MoveMini
                  : o.PointerType.NoActionMini
                : t
                  ? o.PointerType.Move
                  : o.PointerType.NoMove
            );
          }
          isValid() {
            return (
              !(
                this.sourceObject.isBuilding() &&
                (!this.sourceObject.rules.undeploysInto ||
                  (this.sourceObject.rules.constructionYard && !this.game.gameOpts.mcvRepacks)) &&
                !this.sourceObject.rallyTrait?.getRallyPoint()
              ) &&
              (this.forceMove ||
                !this.target.obj ||
                ((this.target.obj.isOverlay() || this.target.obj.isBuilding()) && this.target.obj.rules.wall) ||
                (this.target.obj.isTechno() &&
                  this.target.obj.owner === this.sourceObject.owner &&
                  this.unitSelection.isSelected(this.target.obj)) ||
                ((this.target.obj.isInfantry() || this.target.obj.isVehicle()) &&
                  !!this.target.obj.disguiseTrait?.hasTerrainDisguise()) ||
                (this.target.obj.isTechno() && !this.game.areFriendly(this.target.obj, this.sourceObject)))
            );
          }
          isAllowed() {
            return (
              (!this.sourceObject.isUnit() || !this.sourceObject.moveTrait.isDisabled()) &&
              (this.game.mapShroudTrait
                .getPlayerShroud(this.sourceObject.owner)
                ?.isShrouded(this.target.tile, this.target.obj?.tileElevation)
                ? this.sourceObject.rules.moveToShroud
                : !(
                    !this.forceMove &&
                    this.target.obj?.isTechno() &&
                    this.target.obj.owner === this.sourceObject.owner &&
                    this.unitSelection.isSelected(this.target.obj)
                  ))
            );
          }
          process() {
            const e = this.sourceObject;
            // OpenYRWeb: deploy-fire units undeploy before moving
            e.isUnit() && e.deployerTrait?.isDeployed() && e.deployerTrait.setDeployed(!1);
            if (!e.isBuilding() || !e.rallyTrait?.getRallyPoint()) {
              var t = this.game.rules.general.closeEnough;
              return e.isBuilding() && e.rules.undeploysInto
                ? [
                    new r.UndeployIntoTask(this.game),
                    new a.MoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
                      closeEnoughTiles: t,
                      forceMove: this.forceMove,
                    }),
                  ]
                : e.isUnit()
                  ? this.isEnemyBuildingBlock()
                    ? [new p.MoveToBlockTask(this.game, this.target.obj)]
                    : this.isFollowMove()
                      ? [new T.MoveTargetTask(this.game, this.target.obj)]
                      : [
                          new a.MoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
                            closeEnoughTiles: t,
                            forceMove: this.forceMove,
                          }),
                        ]
                  : void 0;
            }
          }
          isEnemyBuildingBlock() {
            return (
              this.forceMove &&
              this.sourceObject.isVehicle() &&
              !this.sourceObject.rules.consideredAircraft &&
              this.target.obj?.isBuilding() &&
              !this.game.areFriendly(this.sourceObject, this.target.obj)
            );
          }
          isFollowMove() {
            return (
              this.forceMove &&
              this.target.obj?.isInfantry() &&
              this.sourceObject.isVehicle() &&
              !this.sourceObject.rules.consideredAircraft &&
              !this.target.obj.moveTrait.isIdle()
            );
          }
          onAdd(t, e) {
            var i = this.sourceObject.isBuilding() && this.sourceObject.rules.undeploysInto;
            if (i && this.sourceObject.buildStatus === d.BuildStatus.BuildUp)
              return (
                this.sourceObject.unitOrderTrait
                  .getTasks()
                  .find((e) => e instanceof g.WaitForBuildUpTask)
                  ?.setCancellable(!0),
                !0
              );
            if (!i && this.sourceObject.isBuilding() && this.sourceObject.rallyTrait?.getRallyPoint())
              return (
                this.sourceObject.rallyTrait.changeRallyPoint(this.target.tile, this.sourceObject, this.game),
                this.game.events.dispatch(new l.RallyPointChangeEvent(this.sourceObject)),
                !1
              );
            if (!this.isEnemyBuildingBlock() && !this.isFollowMove() && !e && this.isValid() && this.isAllowed()) {
              this.sourceObject.attackTrait?.cancelOpportunityFire();
              let e = t.find((e) => e.constructor === a.MoveTask && !e.isCancelling());
              if (e)
                return (
                  e.setForceMove(this.forceMove),
                  e.updateTarget(this.target.tile, !!this.target.getBridge(), !0),
                  e.children.length && e.children[0] instanceof u.AttackTask && e.children[0].cancel(),
                  t.splice(t.indexOf(e) + 1),
                  this.sourceObject.unitOrderTrait.clearOrders(),
                  !1
                );
              if (this.sourceObject.isUnit() && this.sourceObject.rules.movementZone === c.MovementZone.Fly) {
                let e = t.find(
                  (e) =>
                    [u.AttackTask, f.AttackMoveTask, y.AttackMoveTargetTask].includes(e.constructor) &&
                    !e.isCancelling(),
                );
                e && e.forceCancel(this.sourceObject) && t.splice(t.indexOf(e));
              }
            }
            return !0;
          }
        }),
          e("MoveOrder", v));
      },
    };
  },
);
