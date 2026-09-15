/**
 * Production — 玩家的生产系统（队列集合 + 可建造判定 + 工厂登记）。
 *
 * 每个玩家一份，负责：
 *  - 队列管理：六条 QueueType（Structures/Armory/Infantry/Vehicles/
 *    Ships/Aircrafts），工厂类型 ↔ 队列类型双向映射；
 *  - 可建造判定 isAvailableForProduction：科技等级、buildLimit、超武
 *    侧栏开关、前置建筑（含类别前置与 Secret Lab 授予）、工厂匹配；
 *  - 前置校验 meetsPrerequisites：PrerequisiteOverride 优先 → 归属/黑
 *    名单（CountryRules.isAvailableTo）→ 逐条前置（类别前置查
 *    [General] 六张表）→ 窃取科技（stolenTech）；
 *  - 主工厂登记（primaryFactories 按工厂类型）与工厂数量计数；
 *  - 工业工厂成本乘数 getCostBonusMultiplier（多建筑乘法叠加）。
 *
 * [CHEAT] 字段（cheatsBypass*）为调试用开关，后续移除作弊时一并清理。
 *
 * 由 game/player/production/Production.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ProductionQueue, QueueType } from "game/player/production/ProductionQueue";
import { BuildCat, FactoryType } from "game/rules/TechnoRules";
import { ObjectType } from "engine/type/ObjectType";
import { EventDispatcher } from "util/event";
import { PrereqCategory } from "game/rules/GeneralRules";
import { SideType } from "game/SideType";
import { SuperWeaponType } from "game/type/SuperWeaponType";
import { BuildStatus } from "game/gameobject/Building";

/** 前置键（上划线段名）→ 前置类别。 */
const PREREQ_NAME_TO_CATEGORY = new Map<string, PrereqCategory>()
  .set("POWER", PrereqCategory.Power)
  .set("FACTORY", PrereqCategory.Factory)
  .set("BARRACKS", PrereqCategory.Barracks)
  .set("RADAR", PrereqCategory.Radar)
  .set("TECH", PrereqCategory.Tech)
  .set("PROC", PrereqCategory.Proc);

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Production {
  player: any;
  maxTechLevel: number;
  gameOpts: any;
  rules: any;
  allAvailableObjects: any[];
  buildSpeedModifier: number;
  queues: Map<QueueType, ProductionQueue>;
  _onQueueUpdate: EventDispatcher;
  primaryFactories: Map<FactoryType, any>;
  factoryCounts: Map<FactoryType, number>;
  veteranTypes: Set<any>;
  stolenTech: Set<SideType>;
  /** [CHEAT] 跳过工厂与前置建筑检查，使所有建筑/单位可建造。后续删除作弊时一并移除。 */
  cheatsBypassPrereqs: boolean;
  /** [CHEAT] 突破建造数量限制。后续删除作弊时一并移除。 */
  cheatsBypassBuildLimits: boolean;
  /** [CHEAT] 跳过科技等级限制，允许建造科技等级 -1 及以下（隐藏单位）。 */
  cheatsBypassTechLevel: boolean;
  /** [CHEAT] 随处建造——无视地形（水面/斜坡/不可建地面）与相邻建筑限制。 */
  cheatsBuildAnywhere: boolean;

  /**
   * 工厂：从规则与对话框设置初始化并建好六条队列。
   * 步兵/载具/舰船队列上限取自 MaximumQueuedObjects+1；飞行器初始
   * 上限 0（随停机坪建造动态扩容，见 ProductionTrait）。
   */
  static factory(player: any, rules: any, gameOpts: any, allAvailableObjects: any[]): Production {
    const production = new Production(player, rules.mpDialogSettings.techLevel, gameOpts, rules, allAvailableObjects);
    const maxQueued = rules.general.maximumQueuedObjects + 1;
    production.addQueue(QueueType.Structures, new ProductionQueue(QueueType.Structures, 1, 1));
    production.addQueue(QueueType.Armory, new ProductionQueue(QueueType.Armory, 1, 1));
    production.addQueue(QueueType.Infantry, new ProductionQueue(QueueType.Infantry, maxQueued, maxQueued));
    production.addQueue(QueueType.Vehicles, new ProductionQueue(QueueType.Vehicles, maxQueued, maxQueued));
    production.addQueue(QueueType.Ships, new ProductionQueue(QueueType.Ships, maxQueued, maxQueued));
    production.addQueue(QueueType.Aircrafts, new ProductionQueue(QueueType.Aircrafts, 0, maxQueued));
    return production;
  }

  constructor(
    player: any,
    maxTechLevel: number,
    gameOpts: any,
    rules: any,
    allAvailableObjects: any[],
  ) {
    this.player = player;
    this.maxTechLevel = maxTechLevel;
    this.gameOpts = gameOpts;
    this.rules = rules;
    this.allAvailableObjects = allAvailableObjects;
    this.buildSpeedModifier = 1;
    this.queues = new Map();
    this._onQueueUpdate = new EventDispatcher();
    this.primaryFactories = new Map();
    this.factoryCounts = new Map();
    this.veteranTypes = new Set();
    this.stolenTech = new Set();
    this.cheatsBypassPrereqs = false;
    this.cheatsBypassBuildLimits = false;
    this.cheatsBypassTechLevel = false;
    this.cheatsBuildAnywhere = false;
  }

  /** 队列变化事件（只读视图）。 */
  get onQueueUpdate(): EventDispatcher {
    return this._onQueueUpdate.asEvent();
  }

  addQueue(type: QueueType, queue: ProductionQueue): void {
    this.queues.set(type, queue);
    queue.onUpdate.subscribe(() => this._onQueueUpdate.dispatch(this, queue));
  }

  /** 按队列类型取队列；不存在抛错。 */
  getQueue(type: QueueType): ProductionQueue {
    const queue = this.queues.get(type);
    if (!queue) throw new Error("No queue found with type " + QueueType[type]);
    return queue;
  }

  getAllQueues(): ProductionQueue[] {
    return [...this.queues.values()];
  }

  /** 对象规则 → 应排入的队列类型（建筑按 BuildCat 分防御/常规）。 */
  getQueueTypeForObject(rules: any): QueueType {
    if (rules.type === ObjectType.Building)
      return rules.buildCat === BuildCat.Combat ? QueueType.Armory : QueueType.Structures;
    if (rules.type === ObjectType.Infantry) return QueueType.Infantry;
    if (rules.type === ObjectType.Vehicle) return rules.naval ? QueueType.Ships : QueueType.Vehicles;
    if (rules.type === ObjectType.Aircraft) return QueueType.Aircrafts;
    throw new Error("Unsupported object type " + ObjectType[rules.type]);
  }

  getQueueForObject(rules: any): ProductionQueue {
    return this.getQueue(this.getQueueTypeForObject(rules));
  }

  /** 工厂类型 → 队列类型。 */
  getQueueTypeForFactory(factoryType: FactoryType): QueueType {
    if (factoryType === FactoryType.InfantryType) return QueueType.Infantry;
    if (factoryType === FactoryType.UnitType) return QueueType.Vehicles;
    if (factoryType === FactoryType.AircraftType) return QueueType.Aircrafts;
    if (factoryType === FactoryType.NavalUnitType) return QueueType.Ships;
    throw new Error("Unsupported factory type " + FactoryType[factoryType]);
  }

  /** 队列类型 → 工厂类型。 */
  getFactoryTypeForQueueType(queueType: QueueType): FactoryType {
    if (queueType === QueueType.Structures || queueType === QueueType.Armory) return FactoryType.BuildingType;
    if (queueType === QueueType.Infantry) return FactoryType.InfantryType;
    if (queueType === QueueType.Vehicles) return FactoryType.UnitType;
    if (queueType === QueueType.Aircrafts) return FactoryType.AircraftType;
    if (queueType === QueueType.Ships) return FactoryType.NavalUnitType;
    throw new Error("Unsupported queue type " + QueueType[queueType]);
  }

  getQueueForFactory(factoryType: FactoryType): ProductionQueue {
    return this.getQueue(this.getQueueTypeForFactory(factoryType));
  }

  /**
   * 可建造总判定：科技等级 ∈ [0, maxTechLevel]、buildLimit=0 的非 AI
   * 不可建、被侧栏开关屏蔽的超武不可建、前置与工厂满足。各 [CHEAT]
   * 开关可分别跳过对应检查。
   */
  isAvailableForProduction(rules: any): boolean {
    return (
      (this.cheatsBypassTechLevel || 0 <= rules.techLevel) &&
      rules.techLevel <= this.maxTechLevel &&
      (this.cheatsBypassBuildLimits || !(rules.buildLimit === 0 && !this.player.isAi)) &&
      !(
        rules.superWeapon &&
        this.rules.getSuperWeapon(rules.superWeapon).disableableFromShell &&
        !this.gameOpts.superWeapons &&
        this.rules.getSuperWeapon(rules.superWeapon).type !== SuperWeaponType.ForceShield
      ) &&
      (this.cheatsBypassPrereqs ||
        (this.isSecretLabGranted(rules)
          ? // Secret Lab 授予对象跳过国家/前置检查——实验室本身就是前置。
            // 只要求有匹配的工厂（不限归属），盟军也能造苏军奖励单位。
            this.hasFactoryForType(rules)
          : this.hasFactoryFor(rules) && this.meetsPrerequisites(rules)))
    );
  }

  getAvailableObjects(): any[] {
    return this.allAvailableObjects.filter((rules) => this.isAvailableForProduction(rules));
  }

  /** 是否拥有匹配的工厂（Owner 白名单须与对象归属有交集）。 */
  hasFactoryFor(rules: any): boolean {
    if (rules.owner.length) {
      const factoryType = this.getFactoryTypeFor(rules);
      return !![...this.player.buildings].find(
        (building) =>
          building.factoryTrait?.type === factoryType &&
          (factoryType !== FactoryType.UnitType || building.rules.naval === rules.naval) &&
          !!building.rules.owner.find((ownerName: any) => rules.owner.includes(ownerName)),
      );
    }
    return true;
  }

  /** 窃取科技检查：盟军/苏军/第三阵营窃取标记按需检查。 */
  meetsStolenTech(rules: any): boolean {
    if (rules.requiresStolenAlliedTech) return this.stolenTech.has(SideType.GDI);
    if (rules.requiresStolenSovietTech) return this.stolenTech.has(SideType.Nod);
    return !rules.requiresStolenThirdTech || this.stolenTech.has(SideType.ThirdSide);
  }

  /** 对象 → 工厂类型（建筑/步兵/飞行器按类型，载具按是否海军细分）。 */
  getFactoryTypeFor(rules: any): FactoryType {
    if (rules.type === ObjectType.Building) return FactoryType.BuildingType;
    if (rules.type === ObjectType.Infantry) return FactoryType.InfantryType;
    if (rules.type === ObjectType.Aircraft) return FactoryType.AircraftType;
    return rules.naval ? FactoryType.NavalUnitType : FactoryType.UnitType;
  }

  /**
   * 前置校验（顺序即短路顺序）：
   *  1. PrerequisiteOverride 中任一大写名出现在己方建筑 → 直接通过；
   *  2. 国家归属/黑名单（isAvailableTo）；
   *  3. 逐条 Prerequisite：类别键（POWER/FACTORY/…）查 [General] 六张
   *     表，普通键按建筑名比对；
   *  4. 窃取科技。
   */
  meetsPrerequisites(rules: any): boolean {
    const ownedBuildingNames = [...this.player.buildings].map((building) => building.name);
    for (let override of rules.prerequisiteOverride) {
      override = override.toUpperCase();
      if (ownedBuildingNames.includes(override)) return true;
    }
    if (!rules.isAvailableTo(this.player.country)) return false;
    for (let prereq of rules.prerequisite) {
      prereq = prereq.toUpperCase();
      if (PREREQ_NAME_TO_CATEGORY.has(prereq)) {
        const category = PREREQ_NAME_TO_CATEGORY.get(prereq);
        if (category === undefined) throw new Error("Unknown prereqName " + prereq);
        const candidates = this.rules.general.prereqCategories.get(category);
        if (candidates === undefined) throw new Error(`Missing prerequisite category ${category} in rules`);
        let found = false;
        for (const candidate of candidates) {
          if (ownedBuildingNames.indexOf(candidate) !== -1) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      } else if (ownedBuildingNames.indexOf(prereq) === -1) {
        return false;
      }
    }
    return !!this.meetsStolenTech(rules);
  }

  /**
   * Secret Lab 授予判定：玩家拥有完全建成的 SecretLab=yes 建筑且其
   * 授予对象恰为当前对象时返回 true。按归属判定——谁控制实验室谁能
   * 造奖励对象（重新占领转移奖励，与原版一致）。
   */
  isSecretLabGranted(rules: any): boolean {
    for (const building of this.player.buildings) {
      if (
        building.rules.secretLab &&
        building.buildStatus === BuildStatus.Ready &&
        !building.isDestroyed &&
        building.getSecretProduction?.() === rules.name
      )
        return true;
    }
    return false;
  }

  /**
   * 与 hasFactoryFor 类似但忽略工厂 Owner 白名单——Secret Lab 授予对象
   * 只要求有对应类型的工厂，使盟军能用自己的兵营造苏军奖励单位（DESO）。
   */
  hasFactoryForType(rules: any): boolean {
    if (rules.owner.length) {
      const factoryType = this.getFactoryTypeFor(rules);
      return !![...this.player.buildings].find(
        (building) =>
          building.factoryTrait?.type === factoryType &&
          (factoryType !== FactoryType.UnitType || building.rules.naval === rules.naval),
      );
    }
    return true;
  }

  getPrimaryFactory(factoryType: FactoryType): any {
    return this.primaryFactories.get(factoryType);
  }

  /** 登记主工厂（仅带 Factory= 键的建筑可登记）。 */
  setPrimaryFactory(building: any): void {
    if (building.rules.factory) this.primaryFactories.set(building.rules.factory, building);
  }

  isPrimaryFactory(building: any): boolean {
    return this.getPrimaryFactory(building.rules.factory) === building;
  }

  incrementFactoryCount(factoryType: FactoryType): void {
    this.factoryCounts.set(factoryType, (this.factoryCounts.get(factoryType) ?? 0) + 1);
  }

  /** 递减工厂数量；已为 0 时抛错。 */
  decrementFactoryCount(factoryType: FactoryType): void {
    if (!this.factoryCounts.get(factoryType))
      throw new Error(`Can't decrement factory count ${FactoryType[factoryType]}. Already 0`);
    this.factoryCounts.set(factoryType, this.factoryCounts.get(factoryType) - 1);
  }

  getFactoryCount(factoryType: FactoryType): number {
    return this.factoryCounts.get(factoryType) ?? 0;
  }

  /**
   * 工业工厂（NAINDP）成本乘数：扫描玩家建筑上按对象类别的成本加成
   * 字段（UnitsCostBonus 等），返回全部适用乘数的乘积；无折扣时为 1。
   * 设计说明：多座加成建筑有意采用乘法叠加（0.75×0.75=0.5625），而非
   * 原版的取最优折扣；如需对齐原版行为可改回 Math.min()。
   */
  getCostBonusMultiplier(type: ObjectType): number {
    const fieldName =
      type === ObjectType.Infantry
        ? "infantryCostBonus"
        : type === ObjectType.Vehicle
          ? "unitsCostBonus"
          : type === ObjectType.Aircraft
            ? "aircraftCostBonus"
            : type === ObjectType.Building
              ? "buildingsCostBonus"
              : null;
    if (!fieldName) return 1;
    let multiplier = 1;
    for (const building of this.player.buildings) {
      if (building.buildStatus !== BuildStatus.Ready) continue;
      const bonus = building.rules[fieldName];
      if (bonus !== undefined) multiplier *= bonus;
    }
    return multiplier;
  }

  /** 主工厂被卖/被毁时继承：找同类型的第一座建筑接任，否则删除登记。 */
  crownPrimaryFactoryHeir(factoryType: FactoryType): void {
    const heir = [...this.player.buildings].find((building) => building.rules.factory === factoryType);
    if (heir) this.primaryFactories.set(factoryType, heir);
    else this.primaryFactories.delete(factoryType);
  }

  hasAnyFactory(): boolean {
    return this.primaryFactories.size > 0;
  }

  addVeteranType(type: any): void {
    this.veteranTypes.add(type);
  }

  hasVeteranType(type: any): boolean {
    return this.veteranTypes.has(type);
  }

  addStolenTech(side: SideType): void {
    this.stolenTech.add(side);
  }

  dispose(): void {
    this.queues.clear();
    this.player = undefined;
  }
}
