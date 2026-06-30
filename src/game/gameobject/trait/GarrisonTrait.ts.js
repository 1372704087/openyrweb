// === Reconstructed SystemJS module: game/gameobject/trait/GarrisonTrait ===
// deps: ["game/gameobject/trait/interface/NotifyDestroy","game/map/tileFinder/RadialTileFinder","game/gameobject/trait/interface/NotifyDamage","util/math","game/event/BuildingEvacuateEvent","game/gameobject/task/ScatterTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/GarrisonTrait",
  [
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/trait/interface/NotifyDamage",
    "util/math",
    "game/event/BuildingEvacuateEvent",
    "game/gameobject/task/ScatterTask",
  ],
  function (e, t) {
    "use strict";
    var i, d, r, s, g, p, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        ((a = class {
          constructor(e, t, i) {
            ((this.building = e), (this.evacThreshold = t), (this.maxOccupants = i), (this.units = []));
          }
          isOccupied() {
            return !!this.units.length;
          }
          canBeOccupied() {
            return this.building.healthTrait.health > 100 * this.evacThreshold;
          }
          [r.NotifyDamage.onDamage](e, t) {
            e.healthTrait.health <= 100 * this.evacThreshold && this.evacuate(t);
          }
          [i.NotifyDestroy.onDestroy](e, t, i, r) {
            if (r) {
              for (var s of this.units) ((s.deathType = e.deathType), t.destroyObject(s, i, !0));
              this.units = [];
            } else this.evacuate(t);
          }
          getHash() {
            return s.fnv32a(this.units.map((e) => e.getHash()));
          }
          debugGetState() {
            return { units: this.units.map((e) => e.debugGetState()) };
          }
          dispose() {
            this.building = void 0;
          }
          evacuate(r, s = !1) {
            let a = this.building,
              n = this.units;
            if (n.length) {
              let e = new Map();
              for (var o of n) e.set(o.rules.speedType, (e.get(o.rules.speedType) || []).concat(o));
              for (let [t, i] of e) {
                var l,
                  c = new d.RadialTileFinder(
                    r.map.tiles,
                    r.map.mapBounds,
                    a.tile,
                    a.art.foundation,
                    1,
                    1,
                    (e) =>
                      0 < r.map.terrain.getPassableSpeed(e, t, !0, !1) &&
                      Math.abs(e.z - a.tile.z) < 2 &&
                      !r.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, i[0]).length,
                  ).getNextTile();
                for (l of i) {
                  var h = n.indexOf(l);
                  c
                    ? (n.splice(h, 1),
                      r.unlimboObject(l, c),
                      (l.onBridge = r.map.tileOccupation.getBridgeOnTile(c)?.isLowBridge() ?? !1),
                      (l.position.tileElevation = 0),
                      l.unitOrderTrait.addTask(new p.ScatterTask(r)))
                    : s || (r.destroyObject(l, { player: l.owner }), n.splice(h, 1));
                }
              }
              var u = a.owner;
              // OpenYRWeb: only flip a neutral/capturable garrisonable (e.g. Battle Bunker) back to
              // civilian when its last occupant leaves. Player-built absorbers like the Yuri Bio Reactor
              // (InfantryAbsorb=yes, carries bioReactorPowerTrait) stay owned by their builder —
              // evacuating a power-boosting infantry must NOT surrender the building.
              (n.length ||
                a.isDestroyed ||
                !!a.bioReactorPowerTrait ||
                r.changeObjectOwner(a, r.getCivilianPlayer()),
                r.events.dispatch(new g.BuildingEvacuateEvent(a, u)));
            }
          }
        }),
          e("GarrisonTrait", a));
      },
    };
  },
);
