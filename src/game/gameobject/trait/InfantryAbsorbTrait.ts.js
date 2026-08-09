// === Reconstructed SystemJS module: game/gameobject/trait/InfantryAbsorbTrait ===
// deps: ["game/gameobject/trait/GarrisonTrait","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySell","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/task/EvacuateTransportTask"]
//
// OpenYRWeb: Bio Reactor (YABIOP, Yuri faction) — InfantryAbsorb=yes buildings reuse
// the SAME enter/exit mechanism as Battle Fortress (the transport system), instead of a
// bespoke garrison queue. This trait doubles as the building's transportTrait: it
// implements the TransportTrait container interface (loadQueue / unitFitsInside /
// addToLoadQueue / unitIsFirstInLoadQueue / removeFromLoadQueue) over the same `units`
// array the garrison system (pips, power, frames) reads.
//
// Entry: EnterTransportTask (queueing tile → wait for turn → walk inside → limbo).
// Exit: EvacuateTransportTask (LIFO, one at a time, spawned outside the footprint).
//
// Damage/sell/destroy never expel occupants (vanilla YR): absorbed infantry die with
// the building instead of walking out.

System.register(
  "game/gameobject/trait/InfantryAbsorbTrait",
  [
    "game/gameobject/trait/GarrisonTrait",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySell",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/task/EvacuateTransportTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, d, g, n, oc, Evt, s;
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
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          oc = e;
        },
        function (e) {
          Evt = e;
        },
      ],
      execute: function () {
        ((s = class extends i.GarrisonTrait {
          constructor(e, t) {
            super(e, t);
            this.loadQueue = []; // transport load queue, managed by EnterTransportTask
          }
          canBeOccupied() {
            return !0;
          }
          [d.NotifyDamage.onDamage]() {}
          [g.NotifySell.onSell](e, t) {
            for (var i of this.units) t.destroyObject(i, { player: e.owner });
            this.units = [];
            this.loadQueue.length = 0;
          }
          [r.NotifyDestroy.onDestroy](e, t, i, r) {
            for (var s of this.units) {
              s.deathType = e.deathType;
              t.destroyObject(s, i, !0);
            }
            this.units = [];
            this.loadQueue.length = 0;
          }
          [oc.NotifyOwnerChange.onChange](e, t, i) {
            this.loadQueue.length = 0;
          }
          // Per-tick: drop dead/crashed entries from the load queue (same as TransportTrait).
          [n.NotifyTick.onTick](e, t) {
            this.loadQueue = this.loadQueue.filter((e) => !e.isDestroyed && !e.isCrashing);
          }
          // ---- TransportTrait container interface (shared with Enter/EvacuateTransportTask) ----
          unitFitsInside(e) {
            return (
              !!e &&
              e.rules.size <= (this.building.rules.sizeLimit ?? this.building.rules.maxNumberOccupants) &&
              e.rules.size <= this.getAvailableCapacity()
            );
          }
          getOccupiedCapacity() {
            return this.units.reduce((e, t) => e + t.rules.size, 0);
          }
          getMaxCapacity() {
            return this.building.rules.passengers || this.maxOccupants;
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
          evacuate(e, t = !1) {
            this.loadQueue.length = 0;
            if (this.units.length && this.building) {
              this.building.unitOrderTrait.addTask(new Evt.EvacuateTransportTask(e, !0));
            }
          }
        }),
          e("InfantryAbsorbTrait", s));
      },
    };
  },
);
