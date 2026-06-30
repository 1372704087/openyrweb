// === Reconstructed SystemJS module: game/trait/ProductionTrait ===
// deps: ["game/trait/interface/NotifyTick","game/trait/interface/NotifyUnspawn","game/trait/interface/NotifyOwnerChange","game/player/production/ProductionQueue","game/event/InsufficientFundsEvent","game/rules/TechnoRules","game/trait/interface/NotifySpawn","game/trait/interface/NotifyPower","game/player/trait/PowerTrait","util/math","game/GameSpeed","engine/type/ObjectType","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/ProductionTrait",
  [
    "game/trait/interface/NotifyTick",
    "game/trait/interface/NotifyUnspawn",
    "game/trait/interface/NotifyOwnerChange",
    "game/player/production/ProductionQueue",
    "game/event/InsufficientFundsEvent",
    "game/rules/TechnoRules",
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyPower",
    "game/player/trait/PowerTrait",
    "util/math",
    "game/GameSpeed",
    "engine/type/ObjectType",
    "game/math/GameMath",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, h, u, a, n, o, l, d, c, g, p, m;
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
          h = e;
        },
        function (e) {
          u = e;
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
          d = e;
        },
        function (e) {
          c = e;
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
          constructor(e, t) {
            ((this.rules = e), (this.speedCheat = t), (this.availableObjectRules = new Set()));
            var i = 60 * e.general.buildSpeed * c.GameSpeed.BASE_TICKS_PER_SECOND;
            ((this.baseBuildSpeed = 1 / (i / 1e3)),
              [
                ...e.buildingRules.values(),
                ...e.infantryRules.values(),
                ...e.vehicleRules.values(),
                ...e.aircraftRules.values(),
              ].forEach((e) => {
                e.owner.length && this.availableObjectRules.add(e);
              }));
          }
          [i.NotifyTick.onTick](e) {
            for (var t of e.getCombatants()) for (var i of t.production.getAllQueues()) this.tickQueue(i, t, e);
          }
          [n.NotifySpawn.onSpawn](e, t) {
            var i;
            e.isBuilding() && e.owner.production
              ? (i = e.rules.factory) &&
                (e.owner.production.getPrimaryFactory(i) || e.owner.production.setPrimaryFactory(e),
                e.owner.production.incrementFactoryCount(i),
                i === a.FactoryType.AircraftType && this.updateAircraftQueueMaxSize(e.owner, t))
              : e.isAircraft() &&
                e.owner.production &&
                this.rules.general.padAircraft.includes(e.name) &&
                this.updateAircraftQueueMaxSize(e.owner, t);
          }
          [r.NotifyUnspawn.onUnspawn](e, t) {
            var i;
            e.isBuilding() && e.owner.production
              ? (
                // OpenYRWeb: Slave Miner deploy/undeploy morph must NOT cancel in-progress
                // production. MorphIntoTask sets slaveMinerTrait._morphInFlight=true before
                // unspawning; in that case the building re-spawns as the other form shortly
                // (YAREFN<->YASLMN), so prerequisites remain satisfiable in spirit. Skip
                // ensurePrerequisites for morph only — real destroy/sell still cancel as
                // vanilla. Only applies to slave-miner morphs (the only deployable-refinery).
                (e.slaveMinerTrait && e.slaveMinerTrait._morphInFlight) || this.ensurePrerequisites(e.owner),
                (i = e.rules.factory) &&
                  (e.owner.production.getPrimaryFactory(i) === e && e.owner.production.crownPrimaryFactoryHeir(i),
                  e.owner.production.decrementFactoryCount(i),
                  i === a.FactoryType.AircraftType && this.updateAircraftQueueMaxSize(e.owner, t)))
              : e.isAircraft() &&
                e.owner.production &&
                this.rules.general.padAircraft.includes(e.name) &&
                this.updateAircraftQueueMaxSize(e.owner, t);
          }
          [s.NotifyOwnerChange.onChange](e, t, i) {
            var r;
            e.isBuilding()
              ? (this.ensurePrerequisites(t),
                (r = e.rules.factory) &&
                  (t.production?.getPrimaryFactory(r) === e && t.production.crownPrimaryFactoryHeir(r),
                  e.owner.production &&
                    !e.owner.production.getPrimaryFactory(r) &&
                    e.owner.production.setPrimaryFactory(e),
                  t.production?.decrementFactoryCount(r),
                  e.owner.production?.incrementFactoryCount(r),
                  r === a.FactoryType.AircraftType &&
                    (this.updateAircraftQueueMaxSize(e.owner, i), this.updateAircraftQueueMaxSize(t, i))))
              : e.isAircraft() &&
                this.rules.general.padAircraft.includes(e.name) &&
                (this.updateAircraftQueueMaxSize(e.owner, i), this.updateAircraftQueueMaxSize(t, i));
          }
          [o.NotifyPower.onPowerLow](e) {
            e.production &&
              (e.production.buildSpeedModifier = this.computeLowPowerBuildSpeedModifier(
                e.powerTrait.power,
                e.powerTrait.drain,
              ));
          }
          [o.NotifyPower.onPowerRestore](e) {
            e.production && (e.production.buildSpeedModifier = 1);
          }
          [o.NotifyPower.onPowerChange](e) {
            e.powerTrait?.level === l.PowerLevel.Low &&
              e.production &&
              (e.production.buildSpeedModifier = this.computeLowPowerBuildSpeedModifier(
                e.powerTrait.power,
                e.powerTrait.drain,
              ));
          }
          computeLowPowerBuildSpeedModifier(e, t) {
            var i = 1 - Math.min(1, e / t),
              r = this.rules.general,
              i = (0.3 * r.lowPowerPenaltyModifier * i) / 0.15;
            return d.clamp(1 - i, r.minLowPowerProductionSpeed, r.maxLowPowerProductionSpeed);
          }
          updateAircraftQueueMaxSize(i, r) {
            i.production &&
              r.afterTick(() => {
                var e = [...i.buildings]
                    .filter((e) => e.helipadTrait)
                    .reduce((e, t) => e + t.dockTrait.numberOfDocks, 0),
                  t = i
                    .getOwnedObjectsByType(g.ObjectType.Aircraft, !0)
                    .filter((e) => r.rules.general.padAircraft.includes(e.name)).length;
                i.production.getQueueForFactory(a.FactoryType.AircraftType).maxSize = Math.max(0, e - t);
              });
          }
          tickQueue(i, r, s) {
            if (i.status === h.QueueStatus.Active) {
              let e = !1,
                t = i.getFirst();
              var a,
                n = r.production.getFactoryTypeForQueueType(i.type),
                o = r.production.getFactoryCount(n),
                l = r.production.buildSpeedModifier,
                c = 1 / p.GameMath.pow(this.rules.general.multipleFactory, o - 1),
                n = t.rules.wall ? 1 / this.rules.general.wallBuildSpeedCoefficient : 1,
                o = this.baseBuildSpeed * l * c * n,
                l = t.creditsEach,
                c = l && !this.speedCheat.value ? d.floorTo((l / o) * t.rules.buildTimeMultiplier, 54) : 54,
                c = Math.max(54, c),
                n = r.credits,
                o = t.creditsEach - t.creditsSpent,
                o = Math.min(r.credits, l / c + t.creditsSpentLeftover, o);
              (0 < o
                ? ((a = Math.floor(o)),
                  (t.creditsSpentLeftover = o - a),
                  a &&
                    ((t.creditsSpent += a), (t.progress = t.creditsSpent / t.creditsEach), (r.credits -= a), (e = !0)))
                : t.creditsEach || ((a = t.progress * c), (t.progress = Math.min(1, (1 + a) / c)), (e = !0)),
                e && 1 === t.progress && (i.status = h.QueueStatus.Ready),
                0 < n && !r.credits && s.events.dispatch(new u.InsufficientFundsEvent(r)),
                e && i.notifyUpdated());
            }
          }
          ensurePrerequisites(e) {
            if (e.production)
              for (var t of e.production.getAllQueues()) {
                var i;
                for (i of t
                  .getAll()
                  .map((e) => ({ rules: e.rules, quantity: e.quantity, creditsSpent: e.creditsSpent })))
                  e.production.isAvailableForProduction(i.rules) ||
                    (t.pop(i.rules, i.quantity), (e.credits += i.creditsSpent));
              }
          }
          getAvailableObjects() {
            return [...this.availableObjectRules];
          }
        }),
          e("ProductionTrait", m));
      },
    };
  },
);
