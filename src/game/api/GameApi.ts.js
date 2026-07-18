// === Reconstructed SystemJS module: game/api/GameApi ===
// deps: ["game/player/trait/PowerTrait","game/api/MapApi","engine/type/ObjectType","game/GameSpeed","game/api/RulesApi"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/api/GameApi",
  ["game/player/trait/PowerTrait", "game/api/MapApi", "engine/type/ObjectType", "game/GameSpeed", "game/api/RulesApi"],
  function (e, t) {
    "use strict";
    var r, n, s, a, i, o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
      ],
      execute: function () {
        (e(
          "GameApi",
          (u = class {
            get mapApi() {
              return this.map;
            }
            get rulesApi() {
              return this.rules;
            }
            constructor(e, t) {
              (r.add(this),
                n.set(this, void 0),
                s.set(this, void 0),
                __classPrivateFieldSet(this, n, e, "f"),
                __classPrivateFieldSet(this, s, t, "f"),
                (this.map = new o.MapApi(e)),
                (this.rules = new h.RulesApi(e.rules)));
            }
            isPlayerDefeated(e) {
              return __classPrivateFieldGet(this, n, "f").getPlayerByName(e).defeated;
            }
            areAlliedPlayers(e, t) {
              var i = __classPrivateFieldGet(this, n, "f").getPlayerByName(e);
              if (!i) throw new Error(`Player "${e}" doesn't exist`);
              var r = __classPrivateFieldGet(this, n, "f").getPlayerByName(t);
              if (!r) throw new Error(`Player "${t}" doesn't exist`);
              return __classPrivateFieldGet(this, n, "f").alliances.areAllied(i, r);
            }
            canPlaceBuilding(e, t, i, r) {
              var s = __classPrivateFieldGet(this, n, "f").getPlayerByName(e);
              if (!s) throw new Error(`Player "${e}" doesn't exist`);
              return (
                (r = r ?? {}).ignoreAdjacent ?? (r.ignoreAdjacent = this.rules.getBuilding(t).constructionYard),
                __classPrivateFieldGet(this, n, "f")
                  .getConstructionWorker(s)
                  .canPlaceAt(t, i, { normalizedTile: !0, ...r })
              );
            }
            getBuildingPlacementData(e) {
              var t = __classPrivateFieldGet(this, n, "f").art.getObject(e, l.ObjectType.Building);
              return { foundation: t.foundation, foundationCenter: t.foundationCenter };
            }
            getPlayers() {
              return __classPrivateFieldGet(this, n, "f")
                .getNonNeutralPlayers()
                .map((e) => e.name);
            }
            getPlayerData(e) {
              let t = __classPrivateFieldGet(this, n, "f").getPlayerByName(e);
              if (!t) throw new Error(`Player "${e}" doesn't exist`);
              return {
                name: t.name,
                country: t.country,
                startLocation: this.map.getStartingLocations()[t.startLocation ?? 0],
                isObserver: t.isObserver,
                isAi: t.isAi,
                isCombatant: t.isCombatant(),
                credits: t.credits,
                power: {
                  total: t.powerTrait?.getDisplayPower() ?? 0,
                  drain: t.powerTrait?.drain ?? 0,
                  isLowPower: t.powerTrait?.level === i.PowerLevel.Low,
                },
                radarDisabled: !!t.radarTrait?.isDisabled(),
              };
            }
            addPlayerCredits(e, t) {
              var i = __classPrivateFieldGet(this, n, "f").getPlayerByName(e);
              if (!i) throw new Error(`Player "${e}" doesn't exist`);
              i.credits += t;
            }
            getAllTerrainObjects() {
              return __classPrivateFieldGet(this, n, "f")
                .getWorld()
                .getAllObjects()
                .filter((e) => e.isTerrain())
                .map((e) => e.id);
            }
            getAllUnits(t = () => !0) {
              return __classPrivateFieldGet(this, n, "f")
                .getWorld()
                .getAllObjects()
                .filter((e) => e.isTechno() && t(e.rules))
                .map((e) => e.id);
            }
            getNeutralUnits(t = () => !0) {
              return __classPrivateFieldGet(this, n, "f")
                .getCivilianPlayer()
                .getOwnedObjects()
                .filter((e) => t(e.rules))
                .map((e) => e.id);
            }
            getUnitsInArea(e) {
              return __classPrivateFieldGet(this, n, "f")
                .map.technosByTile.queryRange(e)
                .map((e) => e.id);
            }
            getVisibleUnits(e, r, t = () => !0) {
              const s = __classPrivateFieldGet(this, n, "f").getPlayerByName(e);
              if (!s) throw new Error(`Player "${e}" doesn't exist`);
              if ("self" === r)
                return s
                  .getOwnedObjects()
                  .filter((e) => t(e.rules))
                  .map((e) => e.id);
              let a;
              if ("allied" === r)
                a = (e) => e.owner === s || __classPrivateFieldGet(this, n, "f").alliances.areAllied(e.owner, s);
              else {
                if ("hostile" !== r && "enemy" !== r) throw new Error("Unexpected type " + r);
                {
                  let i = __classPrivateFieldGet(this, n, "f").mapShroudTrait.getPlayerShroud(s);
                  a = (t) =>
                    __classPrivateFieldGet(this, n, "f")
                      .map.tileOccupation.calculateTilesForGameObject(t.tile, t)
                      .some((e) => !i?.isShrouded(e, t.tileElevation)) &&
                    t.owner !== s &&
                    !__classPrivateFieldGet(this, n, "f").alliances.areAllied(t.owner, s) &&
                    ("enemy" !== r || t.owner.isCombatant());
                }
              }
              return __classPrivateFieldGet(this, n, "f")
                .getWorld()
                .getAllObjects()
                .filter((e) => e.isTechno() && !e.isDestroyed && a(e) && t(e.rules))
                .map((e) => e.id);
            }
            getGameObjectData(t) {
              if (__classPrivateFieldGet(this, n, "f").getWorld().hasObjectId(t)) {
                let e = __classPrivateFieldGet(this, n, "f").getObjectById(t);
                return {
                  id: e.id,
                  type: e.type,
                  name: e.name,
                  rules: e.rules,
                  tile: e.tile,
                  tileElevation: e.tileElevation,
                  worldPosition: e.position.worldPosition.clone(),
                  foundation: e.getFoundation(),
                  hitPoints: e.healthTrait?.getHitPoints(),
                  maxHitPoints: e.healthTrait?.maxHitPoints,
                  owner: e.isTechno() ? e.owner.name : void 0,
                };
              }
            }
            getUnitData(t) {
              var i = this.getGameObjectData(t);
              if (i) {
                let e = __classPrivateFieldGet(this, n, "f").getObjectById(t);
                if (!e.isTechno()) throw new Error(`Game object with id ${t} is not a Techno type`);
                return {
                  ...i,
                  owner: e.owner.name,
                  sight: e.sight,
                  veteranLevel: e.veteranLevel,
                  guardMode: e.guardMode,
                  purchaseValue: e.purchaseValue,
                  primaryWeapon: e.primaryWeapon
                    ? __classPrivateFieldGet(this, r, "m", a).call(this, e.primaryWeapon)
                    : void 0,
                  secondaryWeapon: e.secondaryWeapon
                    ? __classPrivateFieldGet(this, r, "m", a).call(this, e.secondaryWeapon)
                    : void 0,
                  deathWeapon: e.armedTrait?.deathWeapon
                    ? __classPrivateFieldGet(this, r, "m", a).call(this, e.armedTrait.deathWeapon)
                    : void 0,
                  attackState: e.attackTrait?.attackState,
                  direction: e.direction,
                  onBridge: e.isInfantry() || e.isVehicle() ? e.onBridge : void 0,
                  zone: e.isUnit() ? e.zone : void 0,
                  buildStatus: e.isBuilding() ? e.buildStatus : void 0,
                  factory:
                    e.isBuilding() && e.factoryTrait
                      ? { deliveringUnit: e.factoryTrait.deliveringUnit?.id, status: e.factoryTrait.status }
                      : void 0,
                  rallyPoint: e.isBuilding() ? e.rallyTrait?.getRallyPoint() : void 0,
                  isPoweredOn: e.isBuilding() && e.poweredTrait?.isPoweredOn(),
                  hasWrenchRepair: e.isBuilding() && !e.autoRepairTrait.isDisabled(),
                  turretFacing: e.isBuilding() || e.isVehicle() ? e.turretTrait?.facing : void 0,
                  turretNo: e.isVehicle() ? e.turretNo : void 0,
                  garrisonUnitCount: e.isBuilding() ? e.garrisonTrait?.units.length : void 0,
                  garrisonUnitsMax: e.isBuilding() ? e.garrisonTrait?.maxOccupants : void 0,
                  passengerSlotCount: e.isVehicle() ? e.transportTrait?.getOccupiedCapacity() : void 0,
                  passengerSlotMax: e.isVehicle() ? e.transportTrait?.getMaxCapacity() : void 0,
                  isIdle: !e.unitOrderTrait.hasTasks(),
                  canMove: e.isUnit() ? !e.moveTrait.isDisabled() : void 0,
                  velocity: e.isUnit() ? e.moveTrait.velocity.clone() : void 0,
                  stance: e.isInfantry() ? e.stance : void 0,
                  harvestedOre: e.isVehicle() ? e.harvesterTrait?.ore : void 0,
                  harvestedGems: e.isVehicle() ? e.harvesterTrait?.gems : void 0,
                  ammo: e.isAircraft() ? e.ammo : void 0,
                  isWarpedOut: e.warpedOutTrait.isActive(),
                  mindControlledBy: e.mindControllableTrait?.getController()?.id,
                  tntTimer: e.tntChargeTrait?.getTicksLeft(),
                };
              }
            }
            getAllSuperWeaponData() {
              return __classPrivateFieldGet(this, n, "f")
                .getCombatants()
                .map((t) =>
                  t.superWeaponsTrait
                    .getAll()
                    .map((e) => ({
                      playerName: t.name,
                      type: e.rules.type,
                      status: e.status,
                      timerSeconds: e.getTimerSeconds(),
                    })),
                )
                .flat();
            }
            getGeneralRules() {
              return __classPrivateFieldGet(this, n, "f").rules.general;
            }
            getRulesIni() {
              return __classPrivateFieldGet(this, n, "f").rules.getIni();
            }
            getArtIni() {
              return __classPrivateFieldGet(this, n, "f").art.getIni();
            }
            getAiIni() {
              return __classPrivateFieldGet(this, n, "f").ai.getIni();
            }
            generateRandomInt(e, t) {
              if (__classPrivateFieldGet(this, s, "f"))
                return __classPrivateFieldGet(this, n, "f").generateRandomInt(e, t);
              var i = this.generateRandom();
              return Math.floor(i * (t - e + 1)) + e;
            }
            generateRandom() {
              return __classPrivateFieldGet(this, s, "f")
                ? __classPrivateFieldGet(this, n, "f").generateRandom()
                : Math.random();
            }
            getTickRate() {
              return __classPrivateFieldGet(this, n, "f").speed.value * c.GameSpeed.BASE_TICKS_PER_SECOND;
            }
            getBaseTickRate() {
              return c.GameSpeed.BASE_TICKS_PER_SECOND;
            }
            getCurrentTick() {
              return __classPrivateFieldGet(this, n, "f").currentTick;
            }
            getCurrentTime() {
              return __classPrivateFieldGet(this, n, "f").currentTime / 1e3;
            }
          }),
        ),
          (n = new WeakMap()),
          (s = new WeakMap()),
          (r = new WeakSet()),
          (a = function (e) {
            return {
              type: e.type,
              rules: e.rules,
              projectileRules: e.projectileRules,
              warheadRules: e.warhead.rules,
              minRange: e.minRange,
              maxRange: e.range,
              speed: e.speed,
              cooldownTicks: e.getCooldownTicks(),
            };
          }));
      },
    };
  },
);
