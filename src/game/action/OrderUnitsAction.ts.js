// === Reconstructed SystemJS module: game/action/OrderUnitsAction ===
// deps: ["data/DataStream","game/action/Action","game/order/OrderType","game/order/orderPriorities","game/order/MoveOrder","game/gameobject/unit/MovePositionHelper","game/order/DeployOrder","game/event/CheerEvent","game/event/DeployNotAllowedEvent","util/typeGuard","game/gameobject/unit/ScatterPositionHelper","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/OrderUnitsAction",
  [
    "data/DataStream",
    "game/action/Action",
    "game/order/OrderType",
    "game/order/orderPriorities",
    "game/order/MoveOrder",
    "game/gameobject/unit/MovePositionHelper",
    "game/order/DeployOrder",
    "game/event/CheerEvent",
    "game/event/DeployNotAllowedEvent",
    "util/typeGuard",
    "game/gameobject/unit/ScatterPositionHelper",
    "game/action/ActionType",
  ],
  function (e, t) {
    "use strict";
    var a, i, d, o, g, p, l, m, c, s, f, n, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        (e("ORDER_UNIT_LIMIT", 128),
          (r = class extends i.Action {
            constructor(e, t, i, r) {
              (super(n.ActionType.OrderUnits),
                (this.game = e),
                (this.map = t),
                (this.orderActionContext = i),
                (this.orderFactory = r),
                (this.queue = !1),
                (this.isInvalid = !1));
            }
            unserialize(e) {
              let t = new a.DataStream(e);
              this.orderType = t.readUint8();
              var i = t.readUint8();
              if (0 !== i) {
                var r = t.readUint16(),
                  s = t.readUint16();
                this.queue = 2 < i && Boolean(t.readUint8());
                let e;
                if (3 < i) {
                  i = t.readUint32();
                  if (!this.game.getWorld().hasObjectId(i)) return void (this.isInvalid = !0);
                  e = this.game.getObjectById(i);
                } else e = void 0;
                s = this.map.tiles.getByMapCoords(r, s);
                s ? (this.target = this.game.createTarget(e, s)) : (this.isInvalid = !0);
              }
            }
            serialize() {
              let e = new a.DataStream(11);
              ((e.dynamicSize = !1), e.writeUint8(this.orderType));
              let t = 0;
              (e.writeUint8(t),
                this.target &&
                  (e.writeUint16(this.target.tile.rx),
                  e.writeUint16(this.target.tile.ry),
                  (t += 2),
                  (i = (this.target.obj || this.target.getBridge())?.id),
                  (!this.queue && void 0 === i) || (e.writeUint8(Number(this.queue)), (t += 1)),
                  void 0 !== i && (e.writeUint32(i), (t += 1))));
              var i = e.position;
              return (0 < t && (e.seek(1), e.writeUint8(t)), new Uint8Array(e.buffer, e.byteOffset, i));
            }
            print() {
              return this.isInvalid
                ? ""
                : d.OrderType[this.orderType] +
                    " order " +
                    (this.target
                      ? `[obj: ${(this.target.obj || this.target.getBridge())?.name || "<none>"}, ` +
                        `tile: ${this.target.tile.rx},${this.target.tile.ry}]` +
                        (this.queue ? "(queue)" : "")
                      : "");
            }
            process() {
              if (!this.isInvalid) {
                let n = this.player;
                const h = this.game.mapShroudTrait.getPlayerShroud(n);
                if (h) {
                  const u = this.target?.obj;
                  if (u) {
                    let e = this.game.map.tileOccupation.calculateTilesForGameObject(u.tile, u);
                    if (!e.find((e) => !h.isShrouded(e, u.tileElevation))) return;
                  }
                  let e = this.validateOrders(n).slice(0, 128),
                    a = [],
                    t = [],
                    r = [],
                    i = [],
                    s = [];
                  if (
                    (e.forEach((e) => {
                      (e instanceof g.MoveOrder
                        ? t
                        : e.orderType === d.OrderType.Scatter
                          ? r
                          : e.orderType === d.OrderType.DeploySelected
                            ? i
                            : e.orderType === d.OrderType.Cheer
                              ? s
                              : a
                      ).push(e);
                    }),
                    t.length && this.target)
                  ) {
                    var o = t[0].isEnemyBuildingBlock(),
                      l = t[0].isFollowMove();
                    if (o || l) t.forEach((e) => a.push(e));
                    else {
                      let r = this.target.getBridge();
                      var c = t[0].forceMove,
                        l = t.map((e) => e.sourceObject);
                      let s = new p.MovePositionHelper(this.map).findPositions(l, this.target.tile, r, c);
                      t.forEach((e) => {
                        var t = s.get(e.sourceObject),
                          i = !r || r.isHighBridge() ? this.map.tileOccupation.getBridgeOnTile(t) : r,
                          t = this.game.createTarget(i, t);
                        ((e.target = t), a.push(e));
                      });
                    }
                  }
                  if (r.length) {
                    c = r.map((e) => e.sourceObject).filter((e) => e.isInfantry() || e.isVehicle());
                    let i = new f.ScatterPositionHelper(this.game).findPositions(c);
                    r.forEach((e) => {
                      var t = i.get(e.sourceObject);
                      t && ((t = this.game.createTarget(t.onBridge, t.tile)), (e.target = t), a.push(e));
                    });
                  }
                  if (i.length) {
                    let t = [];
                    i.forEach((e) => {
                      ((e.sourceObject.isInfantry() || e.sourceObject.isVehicle()) && e.sourceObject.deployerTrait
                        ? t
                        : a
                      ).push(e);
                    });
                    let e = t.filter((e) => !e.sourceObject.deployerTrait.isDeployed());
                    e.length ? e.forEach((e) => a.push(e)) : t.forEach((e) => a.push(e));
                  }
                  (s.length &&
                    (n.cheerCooldownTicks ||
                      ((n.cheerCooldownTicks = this.game.rules.general.maximumCheerRate),
                      a.push(...s),
                      this.game.events.dispatch(new m.CheerEvent(n)))),
                    a.forEach((e) => e.sourceObject.unitOrderTrait.addOrder(e, this.queue)),
                    this.updateWaypointPaths(a));
                }
              }
            }
            validateOrders(e) {
              let i = this.orderActionContext.getOrCreateSelection(e);
              var r,
                s = i.getSelectedUnits();
              let t = this.orderFactory.create(this.orderType, i);
              t.target = this.target;
              let a = [];
              for (r of s)
                if (!(
                  r.owner !== e ||
                  r.rules.spawned ||
                  r.isDestroyed ||
                  r.isCrashing ||
                  r.isDisposed ||
                  r.warpedOutTrait.isActive() ||
                  ((t.sourceObject = r),
                  t instanceof l.DeployOrder &&
                    t.isValid() &&
                    !t.isAllowed() &&
                    this.game.events.dispatch(new c.DeployNotAllowedEvent(r)),
                  t.singleSelectionRequired && 1 < s.length)
                ))
                  if ((this.target || t.targetOptional) && t.isValid() && t.isAllowed()) {
                    let e = this.orderFactory.create(this.orderType, i);
                    (e.set(r, this.target), a.push(e));
                  } else {
                    let t = !1;
                    for (var n of o.orderPriorities) {
                      let e = this.orderFactory.create(n, i);
                      if (
                        (e.set(r, this.target),
                        !(e.singleSelectionRequired && 1 < s.length) &&
                          e.targetOptional === !this.target &&
                          e.isValid() &&
                          e.isAllowed())
                      ) {
                        (a.push(e), (t = !0));
                        break;
                      }
                    }
                    if (!t && this.target && this.orderType !== d.OrderType.Deploy) {
                      let e = this.orderFactory.create(d.OrderType.Move, i);
                      (e.set(r, this.target), e.isValid() && e.isAllowed() && a.push(e));
                    }
                  }
              return a;
            }
            updateWaypointPaths(t) {
              if (this.queue && this.target) {
                let e = t.map((e) => e.sourceObject);
                var i = [...new Set(e.map((e) => e.unitOrderTrait.waypointPath).filter(s.isNotNullOrUndefined))];
                if (i.length <= 1) {
                  var r = {
                    orderType: this.orderType,
                    target: this.target,
                    terminal: t.some((e) => e.terminal),
                    next: void 0,
                  };
                  if (0 === i.length) {
                    let t = { units: e, waypoints: [r] };
                    e.forEach((e) => {
                      e.unitOrderTrait.waypointPath = t;
                    });
                  } else {
                    let e = i[0];
                    ((e.waypoints[e.waypoints.length - 1].next = r), e.waypoints.push(r));
                  }
                }
              }
            }
          }),
          e("OrderUnitsAction", r));
      },
    };
  },
);
