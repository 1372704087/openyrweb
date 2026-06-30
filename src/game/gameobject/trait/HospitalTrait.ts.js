// === Reconstructed SystemJS module: game/gameobject/trait/HospitalTrait ===
// deps: ["engine/type/ObjectType","game/event/UnitRepairFinishEvent","game/GameSpeed","game/map/tileFinder/RadialTileFinder","game/gameobject/task/ScatterTask","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/HospitalTrait",
  [
    "engine/type/ObjectType",
    "game/event/UnitRepairFinishEvent",
    "game/GameSpeed",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c;
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
      ],
      execute: function () {
        ((c = class {
          constructor() {
            this.healQueue = [];
          }
          addToHealQueue(e) {
            return (this.healQueue.push(e), this.healQueue.length - 1);
          }
          unitIsFirstInHealQueue(e) {
            return this.healQueue[0] === e;
          }
          removeFromHealQueue(e) {
            var t = this.healQueue.indexOf(e);
            -1 !== t && this.healQueue.splice(t, 1);
          }
          startHealing(e) {
            if (this.unit)
              throw new Error(`Already busy healing unit ${i.ObjectType[this.unit.type]}#${this.unit.id}}`);
            ((this.unit = e), (this.healTicks = 5 * s.GameSpeed.BASE_TICKS_PER_SECOND));
          }
          [l.NotifyTick.onTick](e, t) {
            var i;
            ((this.healQueue = this.healQueue.filter((e) => !e.isDestroyed && !e.isCrashing)),
              this.unit &&
                void 0 !== this.healTicks &&
                (0 < this.healTicks && this.healTicks--,
                this.healTicks <= 0 &&
                  ((this.healTicks = void 0),
                  this.removeFromHealQueue(this.unit),
                  this.unit.healthTrait.healToFull(e, t),
                  e.ammoTrait && e.ammoTrait.ammo--,
                  this.evacuate(this.unit, e, t),
                  (i = this.unit),
                  (this.unit = void 0),
                  t.events.dispatch(new r.UnitRepairFinishEvent(i, e)))));
          }
          [o.NotifyDestroy.onDestroy](e, t, i) {
            this.unit && ((this.unit.deathType = e.deathType), t.destroyObject(this.unit, i, !0), (this.unit = void 0));
          }
          evacuate(t, i, r) {
            let e;
            var s = { x: i.tile.rx, y: i.tile.ry + i.art.foundation.height },
              s = r.map.tiles.getByMapCoords(s.x, s.y);
            (s && r.map.isWithinBounds(s) && this.canEvacuateTo(s, t, i, r) && (e = s),
              (e =
                e ||
                new a.RadialTileFinder(r.map.tiles, r.map.mapBounds, i.tile, i.art.foundation, 1, 1, (e) =>
                  this.canEvacuateTo(e, t, i, r),
                ).getNextTile()),
              e
                ? (r.unlimboObject(t, e), t.unitOrderTrait.addTask(new n.ScatterTask(r)))
                : r.destroyObject(t, { player: t.owner }));
          }
          canEvacuateTo(e, t, i, r) {
            return (
              0 < r.map.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !1) &&
              Math.abs(e.z - i.tile.z) < 2 &&
              !r.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length
            );
          }
        }),
          e("HospitalTrait", c));
      },
    };
  },
);
