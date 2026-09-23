/**
 * GameApi — 游戏对外主门面（地图/规则 + 玩家/对象/超武/随机/tick 查询）。
 *
 * 构造 (game, useSyncedRng)：内部 new MapApi(game) / RulesApi(game.rules)，
 * 公开 map / rules 并以 mapApi / rulesApi getter 别名暴露。绝大多数查询
 * 委托 game；随机数在 useSyncedRng 为真时走 game.generateRandom*，否则
 * 本地 Math.random 兜底。
 *
 * 由 game/api/GameApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { PowerLevel } from "game/player/trait/PowerTrait"; // 已转换
import { MapApi } from "game/api/MapApi"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { RulesApi } from "game/api/RulesApi"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** Game 实例（孪生 WeakMap 字段 n = 第1参）。 */
  private game: any;
  /** 是否走同步 RNG（孪生 WeakMap 字段 s = 第2参布尔）。 */
  private useSyncedRng: any;
  /** 地图门面（孪生公开字段 this.map）。 */
  map: MapApi;
  /** 规则门面（孪生公开字段 this.rules）。 */
  rules: RulesApi;

  get mapApi(): MapApi {
    return this.map;
  }

  get rulesApi(): RulesApi {
    return this.rules;
  }

  constructor(game: any, useSyncedRng: any) {
    this.game = game;
    this.useSyncedRng = useSyncedRng;
    this.map = new MapApi(game);
    this.rules = new RulesApi(game.rules);
  }

  isPlayerDefeated(playerName: any): any {
    return this.game.getPlayerByName(playerName).defeated;
  }

  areAlliedPlayers(nameA: any, nameB: any): any {
    const a = this.game.getPlayerByName(nameA);
    if (!a) throw new Error(`Player "${nameA}" doesn't exist`);
    const b = this.game.getPlayerByName(nameB);
    if (!b) throw new Error(`Player "${nameB}" doesn't exist`);
    return this.game.alliances.areAllied(a, b);
  }

  canPlaceBuilding(
    playerName: any,
    buildingName: any,
    tile: any,
    options?: any,
  ): any {
    const player = this.game.getPlayerByName(playerName);
    if (!player) throw new Error(`Player "${playerName}" doesn't exist`);
    // 孪生: (r = r ?? {}).ignoreAdjacent ?? (r.ignoreAdjacent = this.rules.getBuilding(t).constructionYard)
    const opts = (options = options ?? {});
    if (opts.ignoreAdjacent === void 0 || opts.ignoreAdjacent === null) {
      opts.ignoreAdjacent =
        this.rules.getBuilding(buildingName).constructionYard;
    }
    return this.game
      .getConstructionWorker(player)
      .canPlaceAt(buildingName, tile, { normalizedTile: true, ...opts });
  }

  getBuildingPlacementData(name: any): any {
    const rules = this.game.art.getObject(name, ObjectType.Building);
    return {
      foundation: rules.foundation,
      foundationCenter: rules.foundationCenter,
    };
  }

  getPlayers(): any {
    return this.game.getNonNeutralPlayers().map((p: any) => p.name);
  }

  getPlayerData(playerName: any): any {
    const player = this.game.getPlayerByName(playerName);
    if (!player) throw new Error(`Player "${playerName}" doesn't exist`);
    return {
      name: player.name,
      country: player.country,
      startLocation: this.map.getStartingLocations()[player.startLocation ?? 0],
      isObserver: player.isObserver,
      isAi: player.isAi,
      isCombatant: player.isCombatant(),
      credits: player.credits,
      power: {
        total: player.powerTrait?.getDisplayPower() ?? 0,
        drain: player.powerTrait?.drain ?? 0,
        isLowPower: player.powerTrait?.level === PowerLevel.Low,
      },
      radarDisabled: !!player.radarTrait?.isDisabled(),
    };
  }

  addPlayerCredits(playerName: any, amount: any): void {
    const player = this.game.getPlayerByName(playerName);
    if (!player) throw new Error(`Player "${playerName}" doesn't exist`);
    player.credits += amount;
  }

  getAllTerrainObjects(): any {
    return this.game
      .getWorld()
      .getAllObjects()
      .filter((o: any) => o.isTerrain())
      .map((o: any) => o.id);
  }

  getAllUnits(filter?: any): any {
    const pred = filter !== undefined ? filter : () => true;
    return this.game
      .getWorld()
      .getAllObjects()
      .filter((o: any) => o.isTechno() && pred(o.rules))
      .map((o: any) => o.id);
  }

  getNeutralUnits(filter?: any): any {
    const pred = filter !== undefined ? filter : () => true;
    return this.game
      .getCivilianPlayer()
      .getOwnedObjects()
      .filter((o: any) => pred(o.rules))
      .map((o: any) => o.id);
  }

  getUnitsInArea(area: any): any {
    return this.game.map.technosByTile
      .queryRange(area)
      .map((o: any) => o.id);
  }

  getVisibleUnits(
    playerName: any,
    relation: any,
    filter?: any,
  ): any {
    const pred = filter !== undefined ? filter : () => true;
    const player = this.game.getPlayerByName(playerName);
    if (!player) throw new Error(`Player "${playerName}" doesn't exist`);
    if (relation === "self") {
      return player
        .getOwnedObjects()
        .filter((o: any) => pred(o.rules))
        .map((o: any) => o.id);
    }
    let isVisible: any;
    if (relation === "allied") {
      isVisible = (o: any) =>
        o.owner === player || this.game.alliances.areAllied(o.owner, player);
    } else {
      if (relation !== "hostile" && relation !== "enemy") {
        throw new Error("Unexpected type " + relation);
      }
      const shroud = this.game.mapShroudTrait.getPlayerShroud(player);
      isVisible = (o: any) =>
        this.game.map.tileOccupation
          .calculateTilesForGameObject(o.tile, o)
          .some((t: any) => !shroud?.isShrouded(t, o.tileElevation)) &&
        o.owner !== player &&
        !this.game.alliances.areAllied(o.owner, player) &&
        (relation !== "enemy" || o.owner.isCombatant());
    }
    return this.game
      .getWorld()
      .getAllObjects()
      .filter(
        (o: any) => o.isTechno() && !o.isDestroyed && isVisible(o) && pred(o.rules),
      )
      .map((o: any) => o.id);
  }

  getGameObjectData(id: any): any {
    if (this.game.getWorld().hasObjectId(id)) {
      const obj = this.game.getObjectById(id);
      return {
        id: obj.id,
        type: obj.type,
        name: obj.name,
        rules: obj.rules,
        tile: obj.tile,
        tileElevation: obj.tileElevation,
        worldPosition: obj.position.worldPosition.clone(),
        foundation: obj.getFoundation(),
        hitPoints: obj.healthTrait?.getHitPoints(),
        maxHitPoints: obj.healthTrait?.maxHitPoints,
        owner: obj.isTechno() ? obj.owner.name : void 0,
      };
    }
    // 孪生：id 不存在时隐式返回 undefined
  }

  getUnitData(id: any): any {
    const base = this.getGameObjectData(id);
    if (base) {
      const obj = this.game.getObjectById(id);
      if (!obj.isTechno())
        throw new Error(`Game object with id ${id} is not a Techno type`);
      return {
        ...base,
        owner: obj.owner.name,
        sight: obj.sight,
        veteranLevel: obj.veteranLevel,
        guardMode: obj.guardMode,
        purchaseValue: obj.purchaseValue,
        primaryWeapon: obj.primaryWeapon
          ? this.serializeWeapon(obj.primaryWeapon)
          : void 0,
        secondaryWeapon: obj.secondaryWeapon
          ? this.serializeWeapon(obj.secondaryWeapon)
          : void 0,
        deathWeapon: obj.armedTrait?.deathWeapon
          ? this.serializeWeapon(obj.armedTrait.deathWeapon)
          : void 0,
        attackState: obj.attackTrait?.attackState,
        direction: obj.direction,
        onBridge:
          obj.isInfantry() || obj.isVehicle() ? obj.onBridge : void 0,
        zone: obj.isUnit() ? obj.zone : void 0,
        buildStatus: obj.isBuilding() ? obj.buildStatus : void 0,
        factory:
          obj.isBuilding() && obj.factoryTrait
            ? {
                deliveringUnit: obj.factoryTrait.deliveringUnit?.id,
                status: obj.factoryTrait.status,
              }
            : void 0,
        rallyPoint: obj.isBuilding() ? obj.rallyTrait?.getRallyPoint() : void 0,
        isPoweredOn:
          obj.isBuilding() && obj.poweredTrait?.isPoweredOn(),
        hasWrenchRepair:
          obj.isBuilding() && !obj.autoRepairTrait.isDisabled(),
        turretFacing:
          obj.isBuilding() || obj.isVehicle() ? obj.turretTrait?.facing : void 0,
        turretNo: obj.isVehicle() ? obj.turretNo : void 0,
        garrisonUnitCount: obj.isBuilding()
          ? obj.garrisonTrait?.units.length
          : void 0,
        garrisonUnitsMax: obj.isBuilding()
          ? obj.garrisonTrait?.maxOccupants
          : void 0,
        passengerSlotCount: obj.isVehicle()
          ? obj.transportTrait?.getOccupiedCapacity()
          : void 0,
        passengerSlotMax: obj.isVehicle()
          ? obj.transportTrait?.getMaxCapacity()
          : void 0,
        isIdle: !obj.unitOrderTrait.hasTasks(),
        canMove: obj.isUnit() ? !obj.moveTrait.isDisabled() : void 0,
        velocity: obj.isUnit() ? obj.moveTrait.velocity.clone() : void 0,
        stance: obj.isInfantry() ? obj.stance : void 0,
        harvestedOre: obj.isVehicle() ? obj.harvesterTrait?.ore : void 0,
        harvestedGems: obj.isVehicle() ? obj.harvesterTrait?.gems : void 0,
        ammo: obj.isAircraft() ? obj.ammo : void 0,
        isWarpedOut: obj.warpedOutTrait.isActive(),
        mindControlledBy: obj.mindControllableTrait?.getController()?.id,
        tntTimer: obj.tntChargeTrait?.getTicksLeft(),
      };
    }
  }

  getAllSuperWeaponData(): any {
    return this.game
      .getCombatants()
      .map((player: any) =>
        player.superWeaponsTrait
          .getAll()
          .map((sw: any) => ({
            playerName: player.name,
            type: sw.rules.type,
            status: sw.status,
            timerSeconds: sw.getTimerSeconds(),
          })),
      )
      .flat();
  }

  getGeneralRules(): any {
    return this.game.rules.general;
  }

  getRulesIni(): any {
    return this.game.rules.getIni();
  }

  getArtIni(): any {
    return this.game.art.getIni();
  }

  getAiIni(): any {
    return this.game.ai.getIni();
  }

  addAttackTargetMarker(rx: any, ry: any, teamName: any): void {
    // 脚本化小队攻击指定路点时登记目标标记（GUI 层渲染）
    const g = this.game;
    g.attackTargetMarkers = g.attackTargetMarkers || [];
    g.attackTargetMarkers.push({
      rx: rx,
      ry: ry,
      teamName: teamName || "",
      expireTick: g.currentTick + 900,
    });
  }

  generateRandomInt(min: any, max: any): any {
    if (this.useSyncedRng) return this.game.generateRandomInt(min, max);
    const r = this.generateRandom();
    return Math.floor(r * (max - min + 1)) + min;
  }

  generateRandom(): any {
    return this.useSyncedRng ? this.game.generateRandom() : Math.random();
  }

  getTickRate(): any {
    return this.game.speed.value * GameSpeed.BASE_TICKS_PER_SECOND;
  }

  getBaseTickRate(): any {
    return GameSpeed.BASE_TICKS_PER_SECOND;
  }

  getCurrentTick(): any {
    return this.game.currentTick;
  }

  getCurrentTime(): any {
    return this.game.currentTime / 1000;
  }

  /** Weapon → 对外快照（孪生 WeakSet 私有方法 a）。 */
  private serializeWeapon(weapon: any): any {
    return {
      type: weapon.type,
      rules: weapon.rules,
      projectileRules: weapon.projectileRules,
      warheadRules: weapon.warhead.rules,
      minRange: weapon.minRange,
      maxRange: weapon.range,
      speed: weapon.speed,
      cooldownTicks: weapon.getCooldownTicks(),
    };
  }
}
