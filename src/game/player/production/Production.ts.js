// === Reconstructed SystemJS module: game/player/production/Production ===
// deps: ["game/player/production/ProductionQueue","game/rules/TechnoRules","engine/type/ObjectType","util/event","game/rules/GeneralRules","game/SideType","game/type/SuperWeaponType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/player/production/Production",
  [
    "game/player/production/ProductionQueue",
    "game/rules/TechnoRules",
    "engine/type/ObjectType",
    "util/event",
    "game/rules/GeneralRules",
    "game/SideType",
    "game/type/SuperWeaponType",
    "game/gameobject/Building",
  ],
  function (e, t) {
    "use strict";
    var n, r, i, a, s, o, u, d, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        ((l = new Map()
          .set("POWER", s.PrereqCategory.Power)
          .set("FACTORY", s.PrereqCategory.Factory)
          .set("BARRACKS", s.PrereqCategory.Barracks)
          .set("RADAR", s.PrereqCategory.Radar)
          .set("TECH", s.PrereqCategory.Tech)
          .set("PROC", s.PrereqCategory.Proc)),
          e(
            "Production",
            (c = class c {
              static factory(e, t, i, r) {
                let s = new c(e, t.mpDialogSettings.techLevel, i, t, r);
                var a = t.general.maximumQueuedObjects + 1;
                return (
                  s.addQueue(n.QueueType.Structures, new n.ProductionQueue(n.QueueType.Structures, 1, 1)),
                  s.addQueue(n.QueueType.Armory, new n.ProductionQueue(n.QueueType.Armory, 1, 1)),
                  s.addQueue(n.QueueType.Infantry, new n.ProductionQueue(n.QueueType.Infantry, a, a)),
                  s.addQueue(n.QueueType.Vehicles, new n.ProductionQueue(n.QueueType.Vehicles, a, a)),
                  s.addQueue(n.QueueType.Ships, new n.ProductionQueue(n.QueueType.Ships, a, a)),
                  s.addQueue(n.QueueType.Aircrafts, new n.ProductionQueue(n.QueueType.Aircrafts, 0, a)),
                  s
                );
              }
              constructor(e, t, i, r, s) {
                ((this.player = e),
                  (this.maxTechLevel = t),
                  (this.gameOpts = i),
                  (this.rules = r),
                  (this.allAvailableObjects = s),
                  (this.buildSpeedModifier = 1),
                  (this.queues = new Map()),
                  (this._onQueueUpdate = new a.EventDispatcher()),
                  (this.primaryFactories = new Map()),
                  (this.factoryCounts = new Map()),
                  (this.veteranTypes = new Set()),
                  (this.stolenTech = new Set()),
                  // [CHEAT] 作弊调试用：为true时跳过工厂和前置建筑检查，使所有建筑/单位可建造。后续删除作弊时一并移除
                  (this.cheatsBypassPrereqs = false),
                  // [CHEAT] 作弊调试用：为true时突破建造数量限制。后续删除作弊时一并移除
                  (this.cheatsBypassBuildLimits = false));
              }
              get onQueueUpdate() {
                return this._onQueueUpdate.asEvent();
              }
              addQueue(e, t) {
                (this.queues.set(e, t), t.onUpdate.subscribe(() => this._onQueueUpdate.dispatch(this, t)));
              }
              getQueue(e) {
                var t = this.queues.get(e);
                if (!t) throw new Error("No queue found with type " + n.QueueType[e]);
                return t;
              }
              getAllQueues() {
                return [...this.queues.values()];
              }
              getQueueTypeForObject(e) {
                if (e.type === i.ObjectType.Building)
                  return e.buildCat === r.BuildCat.Combat ? n.QueueType.Armory : n.QueueType.Structures;
                if (e.type === i.ObjectType.Infantry) return n.QueueType.Infantry;
                if (e.type === i.ObjectType.Vehicle) return e.naval ? n.QueueType.Ships : n.QueueType.Vehicles;
                if (e.type === i.ObjectType.Aircraft) return n.QueueType.Aircrafts;
                throw new Error("Unsupported object type " + i.ObjectType[e.type]);
              }
              getQueueForObject(e) {
                return this.getQueue(this.getQueueTypeForObject(e));
              }
              getQueueTypeForFactory(e) {
                if (e === r.FactoryType.InfantryType) return n.QueueType.Infantry;
                if (e === r.FactoryType.UnitType) return n.QueueType.Vehicles;
                if (e === r.FactoryType.AircraftType) return n.QueueType.Aircrafts;
                if (e === r.FactoryType.NavalUnitType) return n.QueueType.Ships;
                throw new Error("Unsupported factory type " + r.FactoryType[e]);
              }
              getFactoryTypeForQueueType(e) {
                if (e === n.QueueType.Structures || e === n.QueueType.Armory) return r.FactoryType.BuildingType;
                if (e === n.QueueType.Infantry) return r.FactoryType.InfantryType;
                if (e === n.QueueType.Vehicles) return r.FactoryType.UnitType;
                if (e === n.QueueType.Aircrafts) return r.FactoryType.AircraftType;
                if (e === n.QueueType.Ships) return r.FactoryType.NavalUnitType;
                throw new Error("Unsupported queue type " + n.QueueType[e]);
              }
              getQueueForFactory(e) {
                return this.getQueue(this.getQueueTypeForFactory(e));
              }
              isAvailableForProduction(e) {
                return (
                  (this.cheatsBypassPrereqs || -1 !== e.techLevel) &&
                  e.techLevel <= this.maxTechLevel &&
                  (this.cheatsBypassBuildLimits || !(0 === e.buildLimit && !this.player.isAi)) &&
                  !(
                    e.superWeapon &&
                    this.rules.getSuperWeapon(e.superWeapon).disableableFromShell &&
                    !this.gameOpts.superWeapons &&
                    this.rules.getSuperWeapon(e.superWeapon).type !== u.SuperWeaponType.ForceShield
                  ) &&
                  // [CHEAT] 作弊调试用：cheatsBypassPrereqs为true时跳过工厂和前置检查。后续删除作弊时恢复原逻辑
                  (this.cheatsBypassPrereqs || (this.hasFactoryFor(e) && this.meetsPrerequisites(e)))
                );
              }
              getAvailableObjects() {
                return this.allAvailableObjects.filter((e) => this.isAvailableForProduction(e));
              }
              hasFactoryFor(i) {
                if (i.owner.length) {
                  let t = this.getFactoryTypeFor(i);
                  return !![...this.player.buildings].find(
                    (e) =>
                      e.factoryTrait?.type === t &&
                      (t !== r.FactoryType.UnitType || e.rules.naval === i.naval) &&
                      !!e.rules.owner.find((e) => i.owner.includes(e)),
                  );
                }
                return !0;
              }
              meetsStolenTech(e) {
                return e.requiresStolenAlliedTech
                  ? this.stolenTech.has(o.SideType.GDI)
                  : e.requiresStolenSovietTech
                    ? this.stolenTech.has(o.SideType.Nod)
                    : !e.requiresStolenThirdTech || this.stolenTech.has(o.SideType.ThirdSide);
              }
              getFactoryTypeFor(e) {
                return e.type === i.ObjectType.Building
                  ? r.FactoryType.BuildingType
                  : e.type === i.ObjectType.Infantry
                    ? r.FactoryType.InfantryType
                    : e.type === i.ObjectType.Aircraft
                      ? r.FactoryType.AircraftType
                      : e.naval
                        ? r.FactoryType.NavalUnitType
                        : r.FactoryType.UnitType;
              }
              meetsPrerequisites(e) {
                let t = [...this.player.buildings].map((e) => e.name);
                for (var i of e.prerequisiteOverride) if (((i = i.toUpperCase()), t.includes(i))) return !0;
                if (!e.isAvailableTo(this.player.country)) return !1;
                var r;
                for (r of e.prerequisite)
                  if (((r = r.toUpperCase()), l.has(r))) {
                    var s = l.get(r);
                    if (void 0 === s) throw new Error("Unknown prereqName " + r);
                    var a,
                      n = this.rules.general.prereqCategories.get(s);
                    if (void 0 === n) throw new Error(`Missing prerequisite category ${s} in rules`);
                    let e = !1;
                    for (a of n)
                      if (-1 !== t.indexOf(a)) {
                        e = !0;
                        break;
                      }
                    if (!e) return !1;
                  } else if (-1 === t.indexOf(r)) return !1;
                return !!this.meetsStolenTech(e);
              }
              getPrimaryFactory(e) {
                return this.primaryFactories.get(e);
              }
              setPrimaryFactory(e) {
                e.rules.factory && this.primaryFactories.set(e.rules.factory, e);
              }
              isPrimaryFactory(e) {
                return this.getPrimaryFactory(e.rules.factory) === e;
              }
              incrementFactoryCount(e) {
                this.factoryCounts.set(e, (this.factoryCounts.get(e) ?? 0) + 1);
              }
              decrementFactoryCount(e) {
                if (!this.factoryCounts.get(e))
                  throw new Error(`Can't decrement factory count ${r.FactoryType[e]}. Already 0`);
                this.factoryCounts.set(e, this.factoryCounts.get(e) - 1);
              }
              getFactoryCount(e) {
                return this.factoryCounts.get(e) ?? 0;
              }
              // OpenYRWeb: Industrial Plant (NAINDP) cost bonus. Scans the player's buildings
              // for cost-bonus fields (UnitsCostBonus, InfantryCostBonus, etc.) and returns the
              // product of all applicable multipliers for the given object type. Returns 1 when no
              // discount applies.
              // DESIGN NOTE: Multiple cost-bonus buildings intentionally stack multiplicatively
              // (e.g. 0.75 * 0.75 = 0.5625), rather than taking the single best discount as in
              // vanilla YR. This was requested explicitly; revert to Math.min() if balance needs
              // to match original behavior.
              getCostBonusMultiplier(e) {
                var t = e === i.ObjectType.Infantry ? "infantryCostBonus" : e === i.ObjectType.Vehicle ? "unitsCostBonus" : e === i.ObjectType.Aircraft ? "aircraftCostBonus" : e === i.ObjectType.Building ? "buildingsCostBonus" : null;
                if (!t) return 1;
                var r = 1;
                for (var s of this.player.buildings) {
                  if (s.buildStatus !== d.BuildStatus.Ready) continue;
                  var a = s.rules[t];
                  void 0 !== a && (r *= a);
                }
                return r;
              }
              crownPrimaryFactoryHeir(t) {
                var e = [...this.player.buildings].find((e) => e.rules.factory === t);
                e ? this.primaryFactories.set(t, e) : this.primaryFactories.delete(t);
              }
              hasAnyFactory() {
                return 0 < this.primaryFactories.size;
              }
              addVeteranType(e) {
                this.veteranTypes.add(e);
              }
              hasVeteranType(e) {
                return this.veteranTypes.has(e);
              }
              addStolenTech(e) {
                this.stolenTech.add(e);
              }
              dispose() {
                (this.queues.clear(), (this.player = void 0));
              }
            }),
          ));
      },
    };
  },
);
