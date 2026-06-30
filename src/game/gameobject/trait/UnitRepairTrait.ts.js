// === Reconstructed SystemJS module: game/gameobject/trait/UnitRepairTrait ===
// deps: ["game/event/UnitRepairFinishEvent","game/event/UnitRepairStartEvent","game/GameSpeed","game/math/Vector2","game/gameobject/task/move/MoveTask","game/gameobject/unit/ZoneType","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/UnitRepairTrait",
  [
    "game/event/UnitRepairFinishEvent",
    "game/event/UnitRepairStartEvent",
    "game/GameSpeed",
    "game/math/Vector2",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (t, e) {
    "use strict";
    var n, o, l, r, c, h, i, s, u, a;
    e && e.id;
    return {
      setters: [
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
          r = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = u || t("RepairStatus", (u = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.Repairing = 1)] = "Repairing"),
          (a = class {
            constructor() {
              ((this.status = u.Idle), (this.cooldownTicks = 0), (this.lastRepairTickSuccessful = !1));
            }
            [i.NotifySpawn.onSpawn](e, t) {
              this.resetRallyPoint(e, t);
            }
            resetRallyPoint(e, t) {
              var i;
              e.factoryTrait || ((i = this.computeDefaultRallyPoint(e, t.map)), e.rallyTrait.changeRallyPoint(i, e, t));
            }
            [s.NotifyTick.onTick](t, i) {
              if (t.dockTrait && (!t.rules.needsEngineer || !t.owner.isNeutral))
                if (
                  !t.dockTrait.hasDockedUnits() ||
                  t.dockTrait.getDockedUnits().some((e) => e.zone === h.ZoneType.Air) ||
                  (t.poweredTrait && !t.poweredTrait.isPoweredOn())
                )
                  this.status = u.Idle;
                else if (this.cooldownTicks <= 0) {
                  var r,
                    s,
                    a = i.rules.general.repair,
                    a = t.rules.unitReload ? a.reloadRate : a.uRepairRate;
                  this.cooldownTicks += l.GameSpeed.BASE_TICKS_PER_SECOND * a * 60;
                  let e = !1;
                  for (r of t.dockTrait.getDockedUnits())
                    r.zone !== h.ZoneType.Air &&
                      (r.healthTrait.health < 100 && i.areFriendly(r, t)
                        ? (this.tickRepair(r, i, t) && (e = !0),
                          !e ||
                            (this.status !== u.Idle && this.lastRepairTickSuccessful) ||
                            t.helipadTrait ||
                            i.events.dispatch(new o.UnitRepairStartEvent(r)))
                        : ((s = t.rallyTrait.findRallyNodeForUnit(r, i.map)) &&
                            (t.dockTrait.undockUnit(r),
                            r.unitOrderTrait.addTask(
                              new c.MoveTask(i, s.tile, !!s.onBridge, {
                                closeEnoughTiles: i.rules.general.closeEnough,
                              }),
                            )),
                          t.helipadTrait || i.events.dispatch(new n.UnitRepairFinishEvent(r, t))));
                  ((this.lastRepairTickSuccessful = e), (this.status = e ? u.Repairing : u.Idle));
                } else this.cooldownTicks--;
            }
            tickRepair(e, t, i) {
              var r = t.rules.general.repair,
                s = Math.floor(r.repairStep),
                a = r.repairPercent;
              let n;
              if (a) {
                ((r = (a * e.purchaseValue) / e.healthTrait.maxHitPoints),
                  (a = Math.min(e.owner.credits, Math.max(1, Math.floor(r * s)))));
                if (((n = r && a ? Math.floor(a / r) : s), !a)) return !1;
                e.owner.credits -= a;
              } else n = s;
              return (
                (n = Math.min(n, e.healthTrait.maxHitPoints - e.healthTrait.getHitPoints())),
                !!n && (e.healthTrait.healBy(n, i, t), !0)
              );
            }
            computeDefaultRallyPoint(e, t) {
              var i = e.getFoundation(),
                i = new r.Vector2(e.tile.rx, e.tile.ry + i.height);
              return t.tiles.getByMapCoords(i.x, i.y) ?? e.tile;
            }
          }),
          t("UnitRepairTrait", a));
      },
    };
  },
);
