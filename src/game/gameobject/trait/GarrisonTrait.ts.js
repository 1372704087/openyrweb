﻿// === Reconstructed SystemJS module: game/gameobject/trait/GarrisonTrait ===
// deps: ["game/gameobject/trait/interface/NotifyDestroy","game/map/tileFinder/RadialTileFinder","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySell","util/math","game/event/BuildingEvacuateEvent","game/gameobject/task/ScatterTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/GarrisonTrait",
  [
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySell",
    "util/math",
    "game/event/BuildingEvacuateEvent",
    "game/gameobject/task/ScatterTask",
  ],
  function (e, t) {
    "use strict";
    var i, d, r, s, g, p, a, n;
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
          g = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class {
          constructor(e, t, i) {
            ((this.building = e), (this.evacThreshold = t), (this.maxOccupants = i), (this.units = []));
          }
          isOccupied() {
            return !!this.units.length;
          }
          canBeOccupied() {
            return this.building.rules.infantryAbsorb || this.building.healthTrait.health > 100 * this.evacThreshold;
          }
          [r.NotifyDamage.onDamage](e, t) {
            !e.rules.infantryAbsorb && e.healthTrait.health <= 100 * this.evacThreshold && this.evacuate(t);
          }
          [i.NotifyDestroy.onDestroy](e, t, i, r) {
            if (r) {
              for (var s of this.units) ((s.deathType = e.deathType), t.destroyObject(s, i, !0));
              this.units = [];
            } else this.evacuate(t);
          }
          [g.NotifySell.onSell](e, t) {
            this.evacuate(t);
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
            let n = this.building,
              o = this.units;
            if (o.length) {
              let e = new Map();
              for (var l of o) e.set(l.rules.speedType, (e.get(l.rules.speedType) || []).concat(l));
              for (let [t, i] of e) {
                var c,
                  h = new d.RadialTileFinder(
                    r.map.tiles,
                    r.map.mapBounds,
                    n.tile,
                    n.art.foundation,
                    1,
                    1,
                    (e) =>
                      0 < r.map.terrain.getPassableSpeed(e, t, !0, !1) &&
                      Math.abs(e.z - n.tile.z) < 2 &&
                      !r.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, i[0]).length,
                  ).getNextTile();
                for (c of i) {
                  var u = o.indexOf(c);
                  h
                    ? (o.splice(u, 1),
                      r.unlimboObject(c, h),
                      (c.onBridge = r.map.tileOccupation.getBridgeOnTile(h)?.isLowBridge() ?? !1),
                      (c.position.tileElevation = 0),
                      c.unitOrderTrait.addTask(new a.ScatterTask(r)))
                    : s || (r.destroyObject(c, { player: c.owner }), o.splice(u, 1));
                }
              }
              var f = n.owner;
              // OpenYRWeb: only flip a neutral/capturable garrisonable (e.g. Battle Bunker) back to
              // civilian when its last occupant leaves. Player-built absorbers like the Yuri Bio Reactor
              // (InfantryAbsorb=yes, carries bioReactorPowerTrait) stay owned by their builder —
              // evacuating a power-boosting infantry must NOT surrender the building.
              (o.length ||
                n.isDestroyed ||
                !!n.bioReactorPowerTrait ||
                r.changeObjectOwner(n, r.getCivilianPlayer()),
                r.events.dispatch(new p.BuildingEvacuateEvent(n, f)));
            }
          }
        }),
          e("GarrisonTrait", n));
      },
    };
  },
);
