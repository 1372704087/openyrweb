// === Reconstructed SystemJS module: game/gameobject/task/EnterTransportTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveOutsideTask","game/gameobject/task/move/MoveInsideTask","game/event/EnterTransportEvent","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/map/tileFinder/RadialTileFinder","game/gameobject/unit/MovePositionHelper","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/event/EnterObjectEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EnterTransportTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveOutsideTask",
    "game/gameobject/task/move/MoveInsideTask",
    "game/event/EnterTransportEvent",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/MoveTrait",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/unit/MovePositionHelper",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/event/EnterObjectEvent",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p;
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
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        var e;
        (((e = g = g || {})[(e.MoveToQueueingTile = 0)] = "MoveToQueueingTile"),
          (e[(e.WaitForTurn = 1)] = "WaitForTurn"),
          (e[(e.MoveToTransport = 2)] = "MoveToTransport"),
          (e[(e.EnterTransport = 3)] = "EnterTransport"),
          (e[(e.ClearTransport = 4)] = "ClearTransport"),
          (p = class extends i.Task {
            constructor(e, t) {
              (super(),
                (this.game = e),
                (this.target = t),
                (this.movePerformed = !1),
                (this.preventOpportunityFire = !1));
            }
            isAllowed(e) {
              return (
                !this.target.isDestroyed &&
                !this.target.isCrashing &&
                this.game.areFriendly(this.target, e) &&
                e.zone !== n.ZoneType.Air &&
                this.target.zone !== n.ZoneType.Air &&
                this.target.transportTrait.unitFitsInside(e) &&
                this.target.moveTrait.moveState === o.MoveState.Idle &&
                !this.target.warpedOutTrait.isActive() &&
                !e.mindControllableTrait?.isActive() &&
                !e.mindControllerTrait?.isActive()
              );
            }
            onStart(e) {
              if (!this.target.transportTrait) throw new Error(`Unit ${this.target.name} is not a valid transport`);
              ((this.initialTargetTile = this.target.tile),
                0 < this.target.transportTrait.addToLoadQueue(e)
                  ? (this.state = g.MoveToQueueingTile)
                  : (this.state = g.MoveToTransport));
            }
            onEnd(e) {
              this.target.isDestroyed || this.target.transportTrait?.removeFromLoadQueue(e);
            }
            onTick(n) {
              if (
                (this.isCancelling() && this.state !== g.EnterTransport) ||
                this.state === g.ClearTransport ||
                n.moveTrait.isDisabled()
              )
                return !0;
              if (this.target.tile !== this.initialTargetTile || this.target.moveTrait.moveState !== o.MoveState.Idle)
                return !0;
              if (this.state === g.MoveToQueueingTile) {
                let r = new c.MovePositionHelper(this.game.map),
                  s = this.target.onBridge ? this.game.map.tileOccupation.getBridgeOnTile(this.target.tile) : void 0,
                  a;
                var e = new l.RadialTileFinder(
                  this.game.map.tiles,
                  this.game.map.mapBounds,
                  this.target.tile,
                  this.target.getFoundation(),
                  1,
                  1,
                  (e) => {
                    let t = [this.game.map.tileOccupation.getBridgeOnTile(e)];
                    t[0] && t.push(void 0);
                    for (var i of t)
                      if (
                        0 < this.game.map.terrain.getPassableSpeed(e, n.rules.speedType, n.isInfantry(), !!i) &&
                        r.isEligibleTile(e, i, s, this.target.tile)
                      )
                        return ((a = i), !0);
                    return !1;
                  },
                ).getNextTile();
                return (
                  !e ||
                  (this.children.push(new h.MoveTask(this.game, e, !!a, { closeEnoughTiles: 5 })),
                  this.children.push(
                    new u.CallbackTask(() => {
                      [o.MoveResult.Success, o.MoveResult.CloseEnough].includes(n.moveTrait.lastMoveResult) ||
                        this.cancel();
                    }),
                  ),
                  (this.queueingNode = { tile: e, onBridge: a }),
                  (this.state = g.WaitForTurn),
                  !1)
                );
              }
              if (this.state === g.WaitForTurn) {
                if (!this.target.transportTrait.unitIsFirstInLoadQueue(n)) return !1;
                ((this.queueingNode = void 0), (this.state = g.MoveToTransport));
              }
              if (this.state === g.MoveToTransport) {
                if (!this.isAllowed(n)) return !0;
                if (!this.game.map.tileOccupation.isTileOccupiedBy(n.tile, this.target))
                  return (
                    !!this.movePerformed ||
                    (this.children.push(new s.MoveInsideTask(this.game, this.target)),
                    (this.movePerformed = !0),
                    !(this.preventOpportunityFire = !0))
                  );
                this.state = g.EnterTransport;
              }
              return (
                this.state === g.EnterTransport &&
                (!this.isAllowed(n) || this.isCancelling()
                  ? (this.children.push(new r.MoveOutsideTask(this.game, this.target)),
                    (this.state = g.ClearTransport),
                    !1)
                  : (this.game.limboObject(n, {
                      selected: !1,
                      controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(n).getControlGroupNumber(),
                      inTransport: !0,
                    }),
                    this.game.events.dispatch(new a.EnterTransportEvent(this.target)),
                    this.game.events.dispatch(new d.EnterObjectEvent(this.target, n)),
                    this.target.transportTrait.units.push(n),
                    !0))
              );
            }
            getTargetLinesConfig(e) {
              return {
                target: this.queueingNode ? void 0 : this.target,
                pathNodes: this.queueingNode ? [this.queueingNode] : [],
              };
            }
          }),
          t("EnterTransportTask", p));
      },
    };
  },
);
