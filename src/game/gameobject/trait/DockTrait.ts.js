// === Reconstructed SystemJS module: game/gameobject/trait/DockTrait ===
// deps: ["game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifySell","game/gameobject/trait/DockableTrait","game/Coords","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifySpawn","util/typeGuard","game/gameobject/task/MoveToDockTask","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","game/gameobject/trait/interface/NotifyUnspawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/DockTrait",
  [
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifySell",
    "game/gameobject/trait/DockableTrait",
    "game/Coords",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifySpawn",
    "util/typeGuard",
    "game/gameobject/task/MoveToDockTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/trait/interface/NotifyUnspawn",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m;
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
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        ((m = class {
          constructor(e, t, i, r) {
            ((this.building = e),
              (this.tiles = t),
              (this.numberOfDocks = i),
              (this.dockingOffsets = r),
              (this.ticksWhenWarpedOut = !0),
              (this.unitsByDockNumber = new Array(i).fill(void 0)),
              (this.reservedDocks = new Array(i).fill(void 0)));
          }
          [l.NotifySpawn.onSpawn]() {
            this.dockTiles = [];
            for (let t = 0; t < this.numberOfDocks; t++) {
              var e = this.findDockTile(t);
              if (!e) throw new Error(`Docking tile ${t} not found for object "${this.building.name}"`);
              this.dockTiles[t] = e;
            }
          }
          [p.NotifyUnspawn.onUnspawn]() {
            for (let e = 0; e < this.numberOfDocks; e++) this.unreserveDockAt(e);
          }
          [o.NotifyTick.onTick]() {
            for (let t = 0; t < this.numberOfDocks; t++) {
              var e = this.unitsByDockNumber[t];
              e && e.tile !== this.getDockTile(t) && this.undockUnit(e);
            }
          }
          [i.NotifyDestroy.onDestroy](e, t, i, r) {
            var s = (e.rules.unitRepair || e.helipadTrait) && !e.rules.naval && !i?.weapon?.warhead.rules.temporal;
            if (s)
              for (var a of this.unitsByDockNumber)
                a && !a.isDestroyed && (s ? t.destroyObject(a, i, r) : this.undockUnit(a));
          }
          [s.NotifySell.onSell](r, s) {
            if (r.helipadTrait && this.hasDockedUnits()) {
              var a, e, n;
              let t = [],
                i = 0;
              for (a of [...r.owner.buildings].filter(
                (e) => e.helipadTrait && (e.dockTrait?.getAvailableDockCount() ?? !1) && e !== r,
              )) {
                let e = a.dockTrait?.getAvailableDockCount() ?? 0;
                for (; 0 < e && i < this.unitsByDockNumber.length;) (t.push(a), e--, i++);
                if (i === this.unitsByDockNumber.length) break;
              }
              i = 0;
              for (e of this.unitsByDockNumber)
                (e &&
                  ((n = t[i])
                    ? e.unitOrderTrait.addTask(new h.MoveToDockTask(s, n))
                    : e.unitOrderTrait.addTask(
                        new g.TaskGroup(
                          new u.MoveTask(s, e.tile, !1),
                          new d.CallbackTask((e) => {
                            e.crashableTrait
                              ? e.crashableTrait.crash({ player: r.owner })
                              : s.destroyObject(e, { player: r.owner });
                          }),
                        ).setCancellable(!1),
                      )),
                  i++);
            } else {
              var t,
                i = r.rules.unitRepair && !r.rules.naval;
              for (t of this.unitsByDockNumber) t && (i ? s.sellTrait.sell(t) : this.undockUnit(t));
            }
          }
          [r.NotifyOwnerChange.onChange](e, t, i) {
            for (var r of this.unitsByDockNumber) r && i.changeObjectOwner(r, e.owner);
          }
          getFirstAvailableDockNumber() {
            if (!this.building?.warpedOutTrait.isActive()) {
              var e = this.unitsByDockNumber.findIndex((e, t) => !e && !this.reservedDocks[t]);
              if (-1 !== e) return e;
            }
          }
          getAvailableDockCount() {
            return this.building?.warpedOutTrait.isActive()
              ? 0
              : this.unitsByDockNumber.filter((e, t) => !e && !this.reservedDocks[t]).length;
          }
          getFirstEmptyDockNumber() {
            if (!this.building?.warpedOutTrait.isActive()) {
              var e = this.unitsByDockNumber.findIndex((e) => !e);
              if (-1 !== e) return e;
            }
          }
          getDockOffset(e) {
            if (e > this.numberOfDocks - 1)
              throw new RangeError(`Index ${e} exceeds available docks (${this.numberOfDocks})`);
            return this.dockingOffsets[e];
          }
          getDockTile(e) {
            if (e > this.numberOfDocks - 1)
              throw new RangeError(`Index ${e} exceeds available docks (${this.numberOfDocks})`);
            return this.dockTiles[e];
          }
          getDockNumberByTile(e) {
            var t = this.dockTiles.indexOf(e);
            if (-1 !== t) return t;
          }
          getAllDockTiles() {
            return [...this.dockTiles];
          }
          findDockTile(e) {
            if (e > this.numberOfDocks - 1)
              throw new RangeError(`Index ${e} exceeds available docks (${this.numberOfDocks})`);
            var t = this.building.position.getMapPosition(),
              i = this.getDockOffset(e);
            return this.tiles.getByMapCoords(
              Math.floor((t.x + i.x) / n.Coords.LEPTONS_PER_TILE),
              Math.floor((t.y + i.z) / n.Coords.LEPTONS_PER_TILE),
            );
          }
          isValidUnitForDock(e) {
            return (
              ((this.building.unitRepairTrait &&
                e.isVehicle() &&
                !this.building.helipadTrait &&
                (!e.rules.consideredAircraft || e.rules.landable)) ||
                (e.rules.dock.includes(this.building.name) && !(e.isAircraft() && !this.building.helipadTrait))) &&
              this.building.rules.naval === e.rules.naval
            );
          }
          dockUnitAt(e, t) {
            if (t > this.numberOfDocks - 1)
              throw new RangeError(`Index ${t} exceeds available docks (${this.numberOfDocks})`);
            if (this.unitsByDockNumber[t]) throw new Error("Another unit is already docked at dock #" + t);
            let i = e.traits.find(a.DockableTrait);
            if (!i) throw new Error(`Unit "${e.name}" cannot be docked to ` + this.building.name);
            ((this.unitsByDockNumber[t] = e), (i.dock = this.building));
          }
          undockUnitAt(e) {
            if (e > this.numberOfDocks - 1)
              throw new RangeError(`Index ${e} exceeds available docks (${this.numberOfDocks})`);
            let t = this.unitsByDockNumber[e];
            t && ((this.unitsByDockNumber[e] = void 0), (t.traits.get(a.DockableTrait).dock = void 0));
          }
          undockUnit(e) {
            var t = this.unitsByDockNumber.indexOf(e);
            -1 !== t && this.undockUnitAt(t);
          }
          isDocked(e) {
            return this.unitsByDockNumber.includes(e);
          }
          hasDockedUnits() {
            return !!this.unitsByDockNumber.find((e) => e);
          }
          getDockedUnits() {
            return this.unitsByDockNumber.filter(c.isNotNullOrUndefined);
          }
          reserveDockAt(e, t) {
            if (t > this.numberOfDocks - 1)
              throw new RangeError(`Index ${t} exceeds available docks (${this.numberOfDocks})`);
            if (this.reservedDocks[t])
              throw new Error(`Dock #${t} is already reserved by ` + this.reservedDocks[t].name);
            ((this.reservedDocks[t] = e).traits.get(a.DockableTrait).reservedDock?.dockTrait.unreserveDockForUnit(e),
              (e.traits.get(a.DockableTrait).reservedDock = this.building));
          }
          unreserveDockAt(e) {
            if (e > this.numberOfDocks - 1)
              throw new RangeError(`Index ${e} exceeds available docks (${this.numberOfDocks})`);
            let t = this.reservedDocks[e];
            t && ((this.reservedDocks[e] = void 0), (t.traits.get(a.DockableTrait).reservedDock = void 0));
          }
          unreserveDockForUnit(e) {
            var t = this.reservedDocks.indexOf(e);
            -1 !== t && this.unreserveDockAt(t);
          }
          hasReservedDockForUnit(e) {
            return !!this.reservedDocks.includes(e);
          }
          hasReservedDockAt(e) {
            return !!this.reservedDocks[e];
          }
          getReservedDockForUnit(e) {
            var t = this.reservedDocks.indexOf(e);
            if (-1 !== t) return t;
          }
          dispose() {
            this.building = void 0;
          }
        }),
          e("DockTrait", m));
      },
    };
  },
);
