// === Reconstructed SystemJS module: game/gameobject/task/move/MoveAsideTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/unit/MovePositionHelper","game/gameobject/task/system/WaitTicksTask","game/gameobject/trait/MoveTrait","game/gameobject/task/move/MoveTask","game/math/geometry","game/type/MovementZone","game/gameobject/infantry/StanceType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveAsideTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/unit/MovePositionHelper",
    "game/gameobject/task/system/WaitTicksTask",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/move/MoveTask",
    "game/math/geometry",
    "game/type/MovementZone",
    "game/gameobject/infantry/StanceType",
  ],
  function (e, t) {
    "use strict";
    var i, l, c, h, u, d, g, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
      ],
      execute: function () {
        ((m = class m extends i.Task {
          constructor(e, t) {
            (super(), (this.game = e), (this.fromDirection = t), (this.resolved = !1), (this.chainPushIssued = !1));
          }
          onEnd(e) {
            e.moveTrait.collisionState = h.CollisionState.Resolved;
          }
          onTick(i) {
            if (
              ((this.timeoutTicks = void 0 === this.timeoutTicks ? 0 : this.timeoutTicks + 1),
              40 < this.timeoutTicks || this.resolved || this.isCancelling())
            )
              return !0;
            let r = this.game.map,
              e = new l.MovePositionHelper(r);
            var t = i.onBridge ? r.tileOccupation.getBridgeOnTile(i.tile) : void 0;
            let s, a;
            for (let o = 0; o < 360; o += 45)
              if ((0 !== o || this.chainPushIssued) && 180 !== o) {
                var n = d.rotateVec2(this.fromDirection.clone(), o).round(),
                  n = r.tiles.getByMapCoords(i.tile.rx + Math.sign(n.x), i.tile.ry + Math.sign(n.y));
                if (
                  n &&
                  r.mapBounds.isWithinBounds(n) &&
                  ((a = r.tileOccupation.getBridgeOnTile(n)),
                  i.rules.movementZone === g.MovementZone.Fly ||
                    (!r.terrain.findObstacles({ tile: n, onBridge: a }, i).length && e.isEligibleTile(n, a, t, i.tile)))
                ) {
                  s = n;
                  break;
                }
              }
            if (s)
              return (
                (this.resolved = !0),
                i.isInfantry() && i.deployerTrait && i.deployerTrait.isDeployed() && i.deployerTrait.setDeployed(!1),
                !!i.moveTrait.isDisabled() ||
                  (this.children.push(
                    new u.MoveTask(this.game, s, !!a, { closeEnoughTiles: 0, strictCloseEnough: !0 }),
                  ),
                  !1)
              );
            {
              if (this.chainPushIssued) return (this.children.push(new c.WaitTicksTask(5)), !1);
              let t = r.tiles.getByMapCoords(
                i.tile.rx + Math.sign(this.fromDirection.x),
                i.tile.ry + Math.sign(this.fromDirection.y),
              );
              if (!t || !r.mapBounds.isWithinBounds(t)) return !0;
              a = r.tileOccupation.getBridgeOnTile(t);
              let e = r.tileOccupation
                .getGroundObjectsOnTile(t)
                .filter(
                  (e) =>
                    e.isUnit() &&
                    e.owner === i.owner &&
                    e.tile === t &&
                    e.onBridge === !!a &&
                    !(e.isInfantry() && e.stance === p.StanceType.Paradrop) &&
                    !(e.isAircraft() && e.missileSpawnTrait),
                );
              return e.find(
                (e) => e.moveTrait.collisionState === h.CollisionState.Waiting || e.unitOrderTrait.hasTasks(),
              )
                ? (this.children.push(new c.WaitTicksTask(5)),
                  (i.moveTrait.collisionState = h.CollisionState.Waiting),
                  (i.moveTrait.moveState = h.MoveState.PlanMove),
                  !1)
                : (e.forEach((e) => {
                    e.unitOrderTrait.addTask(new m(this.game, this.fromDirection));
                  }),
                  this.children.push(new c.WaitTicksTask(1)),
                  (i.moveTrait.collisionState = h.CollisionState.Waiting),
                  (i.moveTrait.moveState = h.MoveState.PlanMove),
                  !(this.chainPushIssued = !0));
            }
          }
        }),
          e("MoveAsideTask", m));
      },
    };
  },
);
