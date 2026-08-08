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
    var NotifyTick, NotifyUnspawn, NotifyOwnerChange, ProductionQueue, InsufficientFundsEvent, TechnoRules, NotifySpawn, NotifyPower, PowerTrait, MathUtil, GameSpeed, ObjectType, GameMath, ProductionTrait;
    t && t.id;
    return {
      setters: [
        function (e) {
          NotifyTick = e;
        },
        function (e) {
          NotifyUnspawn = e;
        },
        function (e) {
          NotifyOwnerChange = e;
        },
        function (e) {
          ProductionQueue = e;
        },
        function (e) {
          InsufficientFundsEvent = e;
        },
        function (e) {
          TechnoRules = e;
        },
        function (e) {
          NotifySpawn = e;
        },
        function (e) {
          NotifyPower = e;
        },
        function (e) {
          PowerTrait = e;
        },
        function (e) {
          MathUtil = e;
        },
        function (e) {
          GameSpeed = e;
        },
        function (e) {
          ObjectType = e;
        },
        function (e) {
          GameMath = e;
        },
      ],
      execute: function () {
        ((ProductionTrait = class {
          constructor(e, t) {
            ((this.rules = e), (this.speedCheat = t), (this.availableObjectRules = new Set()));
            var i = 60 * e.general.buildSpeed * GameSpeed.GameSpeed.BASE_TICKS_PER_SECOND;
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
          [NotifyTick.NotifyTick.onTick](e) {
            for (var t of e.getCombatants()) for (var i of t.production.getAllQueues()) this.tickQueue(i, t, e);
          }
          [NotifySpawn.NotifySpawn.onSpawn](e, t) {
            var i;
            e.isBuilding() && e.owner.production
              ? (i = e.rules.factory) &&
                (e.owner.production.getPrimaryFactory(i) || e.owner.production.setPrimaryFactory(e),
                e.owner.production.incrementFactoryCount(i),
                i === TechnoRules.FactoryType.AircraftType && this.updateAircraftQueueMaxSize(e.owner, t))
              : e.isAircraft() && e.owner.production && this.updateAircraftQueueMaxSize(e.owner, t);
          }
          [NotifyUnspawn.NotifyUnspawn.onUnspawn](e, t) {
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
                  i === TechnoRules.FactoryType.AircraftType && this.updateAircraftQueueMaxSize(e.owner, t)))
              : e.isAircraft() && e.owner.production && this.updateAircraftQueueMaxSize(e.owner, t);
          }
          [NotifyOwnerChange.NotifyOwnerChange.onChange](e, t, i) {
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
                  r === TechnoRules.FactoryType.AircraftType &&
                    (this.updateAircraftQueueMaxSize(e.owner, i), this.updateAircraftQueueMaxSize(t, i))))
              : e.isAircraft() && (this.updateAircraftQueueMaxSize(e.owner, i), this.updateAircraftQueueMaxSize(t, i));
          }
          [NotifyPower.NotifyPower.onPowerLow](e) {
            e.production &&
              (e.production.buildSpeedModifier = this.computeLowPowerBuildSpeedModifier(
                e.powerTrait.power,
                e.powerTrait.drain,
              ));
          }
          [NotifyPower.NotifyPower.onPowerRestore](e) {
            e.production && (e.production.buildSpeedModifier = 1);
          }
          [NotifyPower.NotifyPower.onPowerChange](e) {
            e.powerTrait?.level === PowerTrait.PowerLevel.Low &&
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
            return MathUtil.clamp(1 - i, r.minLowPowerProductionSpeed, r.maxLowPowerProductionSpeed);
          }
          updateAircraftQueueMaxSize(i, r) {
            i.production &&
              (() => {
                var e = [...i.buildings]
                    .filter((e) => e.helipadTrait)
                    .reduce((e, t) => e + t.dockTrait.numberOfDocks, 0),
                  t = i.getOwnedObjectsByType(ObjectType.ObjectType.Aircraft, !0);
                /* OpenYRWeb: count owned aircraft that consume Airforce Command
                   production capacity: anything that came out of the factory
                   (isProducedAircraft — this includes Spawned=yes types built
                   via cheats), plus non-spawned types (e.g. starting aircraft).
                   Summoned planes (airstrike MiGs, paradrop planes, carrier
                   planes) are Spawned=yes and were never produced, so they must
                   not consume the aircraft production capacity. */
                var n = t.filter((e) => e.isProducedAircraft || !e.rules.spawned).length;
                /* OpenYRWeb: set _maxSize directly to avoid the setter's
                   side-effect of truncating the items array. Do NOT touch
                   q.size — push/remove manage it. */
                var q = i.production.getQueueForFactory(TechnoRules.FactoryType.AircraftType);
                q._maxSize = Math.max(0, e - n);
                /* OpenYRWeb: notify the queue after _maxSize changes so the
                   sidebar (CombatantSidebarModel) picks up the new value and
                   re-enables/disables the production button accordingly. */
                q.notifyUpdated();
              })();
          }
          tickQueue(i, r, s) {
            if (i.status === ProductionQueue.QueueStatus.Active) {
              let e = !1,
                t = i.getFirst();
              var a,
                n = r.production.getFactoryTypeForQueueType(i.type),
                o = r.production.getFactoryCount(n),
                l = r.production.buildSpeedModifier,
                c = 1 / GameMath.GameMath.pow(this.rules.general.multipleFactory, o - 1),
                n = t.rules.wall ? 1 / this.rules.general.wallBuildSpeedCoefficient : 1,
                o = this.baseBuildSpeed * l * c * n,
                l = t.creditsEach,
                // OpenYRWeb: 秒建造作弊（speedCheat）开启时 1 tick 内完成建造，不再保留
                // 54 tick（一个建造帧，约 3.6s）的最短计时；未开启时维持原版行为：
                // 建造时间取整到 54 tick 的整数倍，且最短一个建造帧
                c = this.speedCheat.value ? 1 : l ? MathUtil.floorTo((l / o) * t.rules.buildTimeMultiplier, 54) : 54,
                c = Math.max(this.speedCheat.value ? 1 : 54, c),
                n = r.credits,
                o = t.creditsEach - t.creditsSpent,
                o = Math.min(r.credits, l / c + t.creditsSpentLeftover, o);
              (0 < o
                ? ((a = Math.floor(o)),
                  (t.creditsSpentLeftover = o - a),
                  a &&
                    ((t.creditsSpent += a), (t.progress = t.creditsSpent / t.creditsEach), (r.credits -= a), (e = !0)))
                : t.creditsEach || ((a = t.progress * c), (t.progress = Math.min(1, (1 + a) / c)), (e = !0)),
                e && 1 === t.progress && (i.status = ProductionQueue.QueueStatus.Ready),
                0 < n && !r.credits && s.events.dispatch(new InsufficientFundsEvent.InsufficientFundsEvent(r)),
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
          e("ProductionTrait", ProductionTrait));
      },
    };
  },
);
