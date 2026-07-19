// === Reconstructed SystemJS module: game/gameobject/trait/TransportTrait ===
// deps: ["util/math","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/task/ScatterTask","game/event/LeaveTransportEvent","game/gameobject/trait/interface/NotifyTick","game/gameobject/unit/ZoneType","game/gameobject/common/DeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TransportTrait",
  [
    "util/math",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/task/ScatterTask",
    "game/event/LeaveTransportEvent",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/common/DeathType",
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
          constructor(e) {
            ((this.obj = e), (this.units = []), (this.loadQueue = []));
          }
          unitFitsInside(e) {
            return !!e && e.rules.size <= this.obj.rules.sizeLimit && e.rules.size <= this.getAvailableCapacity();
          }
          getOccupiedCapacity() {
            return this.units.reduce((e, t) => e + t.rules.size, 0);
          }
          getMaxCapacity() {
            return this.obj.rules.passengers;
          }
          getAvailableCapacity() {
            return this.getMaxCapacity() - this.getOccupiedCapacity();
          }
          addToLoadQueue(e) {
            return (this.loadQueue.push(e), this.loadQueue.length - 1);
          }
          unitIsFirstInLoadQueue(e) {
            return this.loadQueue[0] === e;
          }
          removeFromLoadQueue(e) {
            var t = this.loadQueue.indexOf(e);
            -1 !== t && this.loadQueue.splice(t, 1);
          }
          [n.NotifyTick.onTick](e, t) {
            this.loadQueue = this.loadQueue.filter((e) => !e.isDestroyed && !e.isCrashing);
          }
          [r.NotifyDestroy.onDestroy](e, t, i, r) {
            var s = !!e.armedTrait?.deathWeapon,
              a = i?.weapon?.warhead.rules.parasite;
            if (r || s || e.zone === o.ZoneType.Air || a)
              for (var n of this.units)
                (s && n.armedTrait && (n.armedTrait.deathWeapon = void 0),
                  (n.position.tileElevation = e.position.tileElevation),
                  (n.zone = e.zone),
                  (n.onBridge = e.onBridge),
                  (n.position.tile = e.tile),
                  (n.deathType = e.deathType),
                  t.destroyObject(n, i, !0));
            else this.spawnSurvivors(t);
            this.units = [];
          }
          spawnSurvivors(e) {
            var t = this.obj;
            if (this.units.length) {
              for (var i of this.units)
                if (0 < e.map.terrain.getPassableSpeed(t.tile, i.rules.speedType, i.isInfantry(), t.onBridge)) {
                  (i.owner.addOwnedObject(i),
                    (i.position.tileElevation = t.onBridge
                      ? e.map.tileOccupation.getBridgeOnTile(t.tile).tileElevation
                      : 0),
                    (i.onBridge = t.onBridge),
                    (i.zone = e.map.getTileZone(t.tile, !t.onBridge)),
                    e.unlimboObject(i, t.tile),
                    i.unitOrderTrait.addTask(new s.ScatterTask(e)));
                  const r = e.getUnitSelection();
                  r.isSelected(t) && r.addToSelection(i);
                } else
                  ((i.position.tileElevation = t.position.tileElevation),
                    (i.zone = t.zone),
                    (i.onBridge = t.onBridge),
                    (i.position.tile = t.tile),
                    i.zone === o.ZoneType.Water && (i.deathType = l.DeathType.Sink),
                    i.armedTrait?.deathWeapon && (i.armedTrait.deathWeapon = void 0),
                    e.destroyObject(i, { player: i.owner }));
              e.events.dispatch(new a.LeaveTransportEvent(t));
            }
          }
          getHash() {
            return i.fnv32a(this.units.map((e) => e.getHash()));
          }
          debugGetState() {
            return this.units.map((e) => e.debugGetState());
          }
          dispose() {
            this.obj = void 0;
          }
        }),
          e("TransportTrait", c));
      },
    };
  },
);
