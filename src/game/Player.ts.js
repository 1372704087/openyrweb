// === Reconstructed SystemJS module: game/Player ===
// deps: ["util/Color","engine/type/ObjectType","game/Traits","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Player", ["util/Color", "engine/type/ObjectType", "game/Traits", "util/math"], function (e, t) {
  "use strict";
  var s, i, a, r, n;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        i = e;
      },
      function (e) {
        a = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Player",
        (n = class {
          get credits() {
            return this._credits;
          }
          set credits(e) {
            if (e < 0) throw new RangeError("Can't set credits to a negative value");
            this._credits = e;
          }
          constructor(e, t = void 0, i, r = new s.Color(255, 0, 0)) {
            ((this.name = e),
              (this.country = t),
              (this.startLocation = i),
              (this.color = r),
              (this.isAi = !1),
              (this.defeated = !1),
              (this.resigned = !1),
              (this.dropped = !1),
              (this.objectsByType = new Map()),
              (this.objectsById = new Map()),
              (this.traits = new a.Traits()),
              (this._credits = 0),
              (this.score = 0),
              (this.limitedUnitsBuiltByName = new Map()),
              (this.unitsBuiltByType = new Map()),
              (this.unitsKilledByType = new Map()),
              (this.unitsLostByType = new Map()),
              (this.buildingsCaptured = 0),
              (this.cratesPickedUp = 0),
              (this.creditsGained = 0),
              (this.cheerCooldownTicks = 0),
              (this.isObserver = !t),
              (this.isNeutral = !!t && !t.isPlayable()));
          }
          getOrCreateObjectsForType(e) {
            let t = this.objectsByType.get(e);
            return (t || ((t = new Set()), this.objectsByType.set(e, t)), t);
          }
          addOwnedObject(e) {
            let t = this.getOrCreateObjectsForType(e.type);
            (t.add(e), (e.owner = this).objectsById.set(e.id, e));
          }
          removeOwnedObject(e) {
            let t = this.objectsByType.get(e.type);
            if (!t || !t.has(e)) throw new Error(`GameObject ${e.name} does not belong to player ` + this.name);
            (t.delete(e), this.objectsById.delete(e.id));
          }
          getOwnedObjectById(e) {
            return this.objectsById.get(e);
          }
          getOwnedObjectsByType(e, t = !1) {
            let i = [];
            return ((i = [...(this.objectsByType.get(e) || new Set())]), t || (i = i.filter((e) => !e.limboData)), i);
          }
          getOwnedObjects(e = !1) {
            let t = [];
            return (
              [...this.objectsByType.values()].forEach((e) => {
                e.forEach((e) => t.push(e));
              }),
              e || (t = t.filter((e) => !e.limboData)),
              t
            );
          }
          removeAllOwnedObjects() {
            (this.objectsByType.forEach((e) => e.clear()), this.objectsById.clear());
          }
          get buildings() {
            return this.getOrCreateObjectsForType(i.ObjectType.Building);
          }
          addUnitsBuilt(e, t) {
            (this.unitsBuiltByType.set(e.type, (this.unitsBuiltByType.get(e.type) ?? 0) + t),
              e.buildLimit < 0 &&
                this.limitedUnitsBuiltByName.set(e.name, (this.limitedUnitsBuiltByName.get(e.name) ?? 0) + t));
          }
          getUnitsBuilt(e) {
            return void 0 !== e
              ? (this.unitsBuiltByType.get(e) ?? 0)
              : [...this.unitsBuiltByType.values()].reduce((e, t) => e + t, 0);
          }
          getLimitedUnitsBuilt(e) {
            return this.limitedUnitsBuiltByName.get(e) ?? 0;
          }
          addUnitsKilled(e, t) {
            this.unitsKilledByType.set(e, (this.unitsKilledByType.get(e) ?? 0) + t);
          }
          getUnitsKilled(e) {
            return void 0 !== e
              ? (this.unitsKilledByType.get(e) ?? 0)
              : [...this.unitsKilledByType.values()].reduce((e, t) => e + t, 0);
          }
          addUnitsLost(e, t) {
            this.unitsLostByType.set(e, (this.unitsLostByType.get(e) ?? 0) + t);
          }
          getUnitsLost(e) {
            return void 0 !== e
              ? (this.unitsLostByType.get(e) ?? 0)
              : [...this.unitsLostByType.values()].reduce((e, t) => e + t, 0);
          }
          isCombatant() {
            return !this.isNeutral && !this.isObserver && !this.defeated;
          }
          canProduceVeteran(e) {
            if (!this.production || !this.country) throw new Error("Non-combatants can't produce units");
            var t = this.production.getQueueTypeForObject(e),
              t = this.production.getFactoryTypeForQueueType(t);
            return this.production.hasVeteranType(t) || this.country.hasVeteranUnit(e.type, e.name);
          }
          getHash() {
            return r.fnv32a([this.credits, ...this.traits.getAll().map((e) => e.getHash?.() ?? 0)]);
          }
          debugGetState() {
            return {
              name: this.name,
              credits: this.credits,
              traits: this.traits.getAll().reduce((e, t) => {
                var i = t.debugGetState?.();
                return (void 0 !== i && (e[t.constructor.name] = i), e);
              }, {}),
            };
          }
          dispose() {
            (this.traits.dispose(), this.production?.dispose());
          }
        }),
      );
    },
  };
});
