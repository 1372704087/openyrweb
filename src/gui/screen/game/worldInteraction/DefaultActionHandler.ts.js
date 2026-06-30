// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/DefaultActionHandler ===
// deps: ["engine/type/PointerType","game/Coords","util/typeGuard","util/event","game/order/MoveOrder","game/order/orderPriorities","game/order/OrderFactory","game/order/AttackOrder","game/Target","game/order/AttackMoveOrder","game/order/OrderFeedbackType","game/order/GuardAreaOrder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/DefaultActionHandler",
  [
    "engine/type/PointerType",
    "game/Coords",
    "util/typeGuard",
    "util/event",
    "game/order/MoveOrder",
    "game/order/orderPriorities",
    "game/order/OrderFactory",
    "game/order/AttackOrder",
    "game/Target",
    "game/order/AttackMoveOrder",
    "game/order/OrderFeedbackType",
    "game/order/GuardAreaOrder",
  ],
  function (t, e) {
    "use strict";
    var s, c, u, a, h, d, g, p, i, m, f, y, T, v, r;
    e && e.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          h = e;
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
          i = e;
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
      ],
      execute: function () {
        var e;
        ((T = class {
          constructor(e, t, i, r = !1) {
            ((this.game = e),
              (this.unitSelectionHandler = t),
              (this.currentPlayer = i),
              (this.toggleSelect = r),
              (this.force = !1),
              (this.allowTypeSelect = !1),
              (this.getPointerType = () => s.PointerType.Select),
              (this.isAllowed = () => !0));
          }
          setForce(e) {
            return ((this.force = e), this);
          }
          setTypeSelect(e) {
            return ((this.allowTypeSelect = e), this);
          }
          isValidTarget(e) {
            if (!e?.isTechno()) return !1;
            if (
              this.currentPlayer &&
              (e.isInfantry() || e.isVehicle()) &&
              e.disguiseTrait?.hasTerrainDisguise() &&
              !this.game.alliances.haveSharedIntel(this.currentPlayer, e.owner)
            )
              return !1;
            let t = this.unitSelectionHandler.getSelectedUnits();
            return (
              !(
                !this.toggleSelect &&
                t.some((e) => e.isUnit()) &&
                this.currentPlayer &&
                !this.currentPlayer.isObserver &&
                e.isTechno() &&
                !this.game.areFriendly(e, t[0]) &&
                t[0].owner === this.currentPlayer
              ) &&
              e.rules.selectable &&
              (this.toggleSelect ||
                this.force ||
                (this.allowTypeSelect && 1 === t.length && t[0] === e) ||
                !t.includes(e))
            );
          }
          execute(e) {
            if (this.allowTypeSelect) {
              var t = this.unitSelectionHandler.getSelectedUnits();
              if (1 === t.length && t[0] === e) return void this.unitSelectionHandler.selectByType();
            }
            this.toggleSelect
              ? this.unitSelectionHandler.toggleSelection(e)
              : this.unitSelectionHandler.selectSingleUnit(e);
          }
        }),
          ((e = v || t("ActionFilter", (v = {})))[(e.All = 0)] = "All"),
          (e[(e.SelectOnly = 1)] = "SelectOnly"),
          (e[(e.NoSelect = 2)] = "NoSelect"),
          t(
            "DefaultActionHandler",
            (r = class {
              get onOrder() {
                return this._onOrder.asEvent();
              }
              static factory(e, t, i, r, s, a, n) {
                let o = new this(e, r, n, s.tileOccupation);
                var l = new T(a, i, r);
                return (
                  (o.selectAction = l),
                  r && !r.isObserver
                    ? ((o.defaultActions = [
                        ...d.orderPriorities.map((e) => new g.OrderFactory(a, s).create(e, t)),
                        l,
                        new h.MoveOrder(a, s, t),
                      ]),
                      (o.selectToggleAction = new T(a, i, r, !0)),
                      (o.forceMoveAction = new h.MoveOrder(a, s, t, !0)),
                      (o.forceAttackAction = new p.AttackOrder(a, { forceAttack: !0 })),
                      (o.attackMoveAction = new m.AttackMoveOrder(a, s)),
                      (o.guardAreaAction = new y.GuardAreaOrder(a, !0)),
                      (o.specialActions = [
                        o.selectToggleAction,
                        o.forceMoveAction,
                        o.forceAttackAction,
                        o.attackMoveAction,
                        o.guardAreaAction,
                      ]))
                    : ((o.defaultActions = [l]), (o.specialActions = [])),
                  o
                );
              }
              constructor(e, t, i, r) {
                ((this.renderableManager = e),
                  (this.currentPlayer = t),
                  (this.audioVisualRules = i),
                  (this.tileOccupation = r),
                  (this._onOrder = new a.EventDispatcher()));
              }
              createOrderTarget(e) {
                return new i.Target(e.gameObject, e.tile, this.tileOccupation);
              }
              getDefaultAction(e, t, i, r, s, a, n, o, l) {
                var c = i.gameObject;
                let h = this.selectAction;
                if ((h.setForce(a).setTypeSelect(!1), !e || e.owner !== this.currentPlayer || e.rules.spawned))
                  return !l && s !== v.NoSelect && h.isValidTarget(c) ? h : void 0;
                if (s !== v.NoSelect && !l && o?.shiftKey && !o?.ctrlKey && this.selectToggleAction?.isValidTarget(c))
                  return this.selectToggleAction;
                if (s === v.SelectOnly) return !l && h.setTypeSelect(n).isValidTarget(c) ? h : void 0;
                var u,
                  d = t.every((e) => e.warpedOutTrait.isActive());
                if (o?.ctrlKey && !d)
                  if (o.shiftKey) {
                    if (this.attackMoveAction?.set(e, r).isValid()) return this.attackMoveAction;
                  } else if (o.altKey) {
                    if (this.guardAreaAction?.set(e, r).isValid()) return this.guardAreaAction;
                  } else if (this.forceAttackAction?.set(e, r).isValid()) return this.forceAttackAction;
                if (o?.altKey && !d && this.forceMoveAction?.set(e, r).isValid()) return this.forceMoveAction;
                for (u of this.defaultActions.values())
                  if (u instanceof T) {
                    if (s !== v.NoSelect && !l && u.setForce(a).setTypeSelect(!1).isValidTarget(c)) return u;
                  } else if (
                    !d &&
                    (!l || u.minimapAllowed) &&
                    !(u.singleSelectionRequired && 1 < t.length) &&
                    u.set(e, r).isValid()
                  )
                    return u;
                return l && !d && this.forceMoveAction?.set(e, r).isValid() ? this.forceMoveAction : void 0;
              }
              updateMostSignificantAction(i, r, s, a, n, o, l, c) {
                if (!i.length) return this.getDefaultAction(void 0, i, r, s, a, n, o, l, c);
                let e = i
                    .map((e) => {
                      var t = this.getDefaultAction(e, i, r, s, a, n, o, l, c);
                      if (t) return { unit: e, action: t };
                    })
                    .filter(u.isNotNullOrUndefined),
                  h = [...this.specialActions.values()];
                return e.length
                  ? e.reduce(
                      (e, t) =>
                        !e ||
                        h.includes(t.action) ||
                        this.defaultActions.indexOf(t.action) < this.defaultActions.indexOf(e) ||
                        (!(e instanceof T) &&
                          e.sourceObject.rules.leadershipRating < t.unit.rules.leadershipRating &&
                          this.defaultActions.indexOf(t.action) === this.defaultActions.indexOf(e))
                          ? t.action instanceof T
                            ? t.action
                            : t.action.set(t.unit, s)
                          : e,
                      void 0,
                    )
                  : void 0;
              }
              getPointerType(e) {
                if (this.mostSignificantAction instanceof T) return this.mostSignificantAction.getPointerType();
                if (!this.currentSelected || !this.mostSignificantAction)
                  return e ? s.PointerType.Mini : s.PointerType.Default;
                if (!this.mostSignificantAction.isAllowed()) {
                  var t,
                    i = this.mostSignificantAction.sourceObject;
                  for (t of this.currentSelected)
                    if (
                      (this.mostSignificantAction.set(t, this.currentTarget),
                      this.mostSignificantAction.isValid() && this.mostSignificantAction.isAllowed())
                    )
                      return this.mostSignificantAction.getPointerType(e, this.currentSelected);
                  this.mostSignificantAction.set(i, this.currentTarget);
                }
                return this.mostSignificantAction.getPointerType(e, this.currentSelected);
              }
              update(e, t, i, r, s = !1) {
                var a = (this.currentTarget = this.createOrderTarget(e));
                ((this.currentSelected = t),
                  (this.mostSignificantAction = this.updateMostSignificantAction(t, e, a, v.All, i, !1, r, s)));
              }
              execute(e, t, i, r, s, a, n = !1) {
                let o = (this.currentTarget = this.createOrderTarget(e));
                if (
                  ((this.currentSelected = t),
                  (this.mostSignificantAction = this.updateMostSignificantAction(t, e, o, i, r, s, a, n)),
                  this.mostSignificantAction)
                ) {
                  var l = this.mostSignificantAction.isAllowed();
                  return (
                    l &&
                      (this.mostSignificantAction instanceof h.MoveOrder ||
                      (this.mostSignificantAction instanceof m.AttackMoveOrder && !o.obj?.isTechno()) ||
                      this.mostSignificantAction instanceof y.GuardAreaOrder
                        ? this.renderableManager.createTransientAnim(this.audioVisualRules.moveFlash, (e) => {
                            e.setPosition(
                              c.Coords.tile3dToWorld(
                                o.tile.rx + 0.5,
                                o.tile.ry + 0.5,
                                o.tile.z + (o.getBridge()?.tileElevation ?? 0),
                              ),
                            );
                          })
                        : this.mostSignificantAction instanceof T ||
                          t.includes(e.gameObject) ||
                          e.entity?.highlight?.()),
                    this.mostSignificantAction instanceof T
                      ? this.mostSignificantAction.execute(e.gameObject)
                      : this._onOrder.dispatch(this, {
                          orderType: this.mostSignificantAction.orderType,
                          terminal: this.mostSignificantAction.terminal,
                          feedbackType: l ? this.mostSignificantAction.feedbackType : f.OrderFeedbackType.None,
                          feedbackUnit: l ? this.mostSignificantAction.sourceObject : void 0,
                          target: o,
                        }),
                    !0
                  );
                }
                return !1;
              }
            }),
          ));
      },
    };
  },
);
