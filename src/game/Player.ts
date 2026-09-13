/**
 * Player — 玩家运行时状态：资源、所属对象登记、生产/战斗统计、特性。
 *
 * 一局游戏里每个参战方（人类、AI、中立平民、观察者）各有一个 Player
 * 实例，由 PlayerList 统一注册。字段分组：
 *  - 身份：name / country / color / startLocation / isAi；
 *  - 存活状态：defeated / resigned / dropped（胜负判定与掉线处理用）；
 *  - 对象登记：objectsByType（按 ObjectType 分组的 Set）+ objectsById
 *    （id 索引），由 GameObject.addOwnedObject/removeOwnedObject 维护，
 *    是"玩家有哪些单位/建筑"的唯一事实来源；
 *  - 统计计数：unitsBuilt/Killed/LostByType（按类型累计，用于晋升与
 *    结算面板）、limitedUnitsBuiltByName（buildLimit<0 的按名限建计数）、
 *    buildingsCaptured / cratesPickedUp / creditsGained / score；
 *  - 特性：traits 容器挂玩家级 trait（如生产加成）。
 *
 * isObserver = 没有国家（看戏模式，全图视野）；isNeutral = 国家存在但
 * 不可玩（中立平民，不参与胜负）。
 *
 * getHash() 供锁步联机校验玩家状态一致性。
 *
 * 由 game/Player.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Color } from "util/Color";
import { ObjectType } from "engine/type/ObjectType";
import { Traits } from "game/Traits";
import { fnv32a } from "util/math";
import type { Country } from "game/Country";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Player {
  /** INI 内部名（多人对局中与 [Players] 座位名对应）。 */
  name: string;
  /** 所属国家（观察者/无国籍为 undefined）。 */
  country: Country | undefined;
  /** 开局出生点（地图路点），影响初始部署位置。 */
  startLocation: any;
  /** 阵营色（小地图、单位着色、结盟 UI 使用）。 */
  color: Color;
  /** 是否 AI 控制（影响结盟资格：AI 不能发起请求）。 */
  isAi: boolean;
  /** 已战败（全部建筑/单位损失或认输）。 */
  defeated: boolean;
  /** 主动认输退出。 */
  resigned: boolean;
  /** 网络掉线被移除。 */
  dropped: boolean;
  /** 名下对象登记：ObjectType → Set<GameObject>。 */
  objectsByType: Map<any, Set<any>>;
  /** 名下对象索引：id → GameObject（O(1) 查询）。 */
  objectsById: Map<any, any>;
  /** 玩家级 trait 容器（与 GameObject 的对象级 trait 相区分）。 */
  traits: Traits;
  /** 资金真实存储；对外经 credits 存取器访问（禁止负值）。 */
  _credits: number;
  /** 结算得分（击杀/建造折算）。 */
  score: number;
  /** 限建单位计数：buildLimit<0 的单位按名字累计已建数量。 */
  limitedUnitsBuiltByName: Map<string, number>;
  /** 按类型累计的已建数量（晋升经验与统计用）。 */
  unitsBuiltByType: Map<any, number>;
  /** 按类型累计的击杀数。 */
  unitsKilledByType: Map<any, number>;
  /** 按类型累计的损失数。 */
  unitsLostByType: Map<any, number>;
  /** 占领建筑总数。 */
  buildingsCaptured: number;
  /** 拾取箱子总数。 */
  cratesPickedUp: number;
  /** 全局累计获得资金（收入统计，与当前余额 _credits 区分）。 */
  creditsGained: number;
  /** 嘲讽/欢呼动作的冷却 tick 计数。 */
  cheerCooldownTicks: number;
  /** 观察者：无国家，全图视野，不参与战斗。 */
  isObserver: boolean;
  /** 中立：有国家但不可玩（平民），不受攻击判定与胜负影响。 */
  isNeutral: boolean;
  /** 由游戏侧注入的 生产队列 接口（未转换，任意结构）。 */
  production?: any;

  /** 资金读取。 */
  get credits(): number {
    return this._credits;
  }

  /** 资金写入：资金不允许为负（扣款路径应先自行判断余额）。 */
  set credits(value: number) {
    if (value < 0) throw new RangeError("Can't set credits to a negative value");
    this._credits = value;
  }

  constructor(
    name: string,
    country: Country | undefined = undefined,
    startLocation: any = undefined,
    color: Color = new Color(255, 0, 0),
  ) {
    this.name = name;
    this.country = country;
    this.startLocation = startLocation;
    this.color = color;
    this.isAi = false;
    this.defeated = false;
    this.resigned = false;
    this.dropped = false;
    this.objectsByType = new Map();
    this.objectsById = new Map();
    this.traits = new Traits();
    this._credits = 0;
    this.score = 0;
    this.limitedUnitsBuiltByName = new Map();
    this.unitsBuiltByType = new Map();
    this.unitsKilledByType = new Map();
    this.unitsLostByType = new Map();
    this.buildingsCaptured = 0;
    this.cratesPickedUp = 0;
    this.creditsGained = 0;
    this.cheerCooldownTicks = 0;
    this.isObserver = !country;
    this.isNeutral = !!country && !country.isPlayable();
  }

  // ---- 对象登记：GameObject 挂靠/摘除时回调，维护两张索引表 ----

  private getOrCreateObjectsForType(type: any): Set<any> {
    let set = this.objectsByType.get(type);
    if (!set) {
      set = new Set();
      this.objectsByType.set(type, set);
    }
    return set;
  }

  /** 登记名下对象：按类型入组 + 写 id 索引 + 回写 object.owner。 */
  addOwnedObject(object: any): void {
    const set = this.getOrCreateObjectsForType(object.type);
    set.add(object);
    object.owner = this;
    this.objectsById.set(object.id, object);
  }

  /** 摘除名下对象；对象本不属于该玩家时抛错（状态不一致告警）。 */
  removeOwnedObject(object: any): void {
    const set = this.objectsByType.get(object.type);
    if (!set || !set.has(object))
      throw new Error(`GameObject ${object.name} does not belong to player ` + this.name);
    set.delete(object);
    this.objectsById.delete(object.id);
  }

  getOwnedObjectById(id: any): any {
    return this.objectsById.get(id);
  }

  /**
   * 按类型取名下对象数组。
   * limbo = 处于运输载具货舱等"悬置"状态的对象；默认过滤掉，
   * includeLimbo=true 时连悬置对象一起返回。
   */
  getOwnedObjectsByType(type: any, includeLimbo = false): any[] {
    let objects = [...(this.objectsByType.get(type) || new Set())];
    if (!includeLimbo) objects = objects.filter((object) => !object.limboData);
    return objects;
  }

  /** 名下全部对象（跨所有类型），limbo 过滤规则同上。 */
  getOwnedObjects(includeLimbo = false): any[] {
    const objects = [];
    [...this.objectsByType.values()].forEach((set) => {
      set.forEach((object) => objects.push(object));
    });
    if (!includeLimbo) return objects.filter((object) => !object.limboData);
    return objects;
  }

  /** 清空登记（不移交、不销毁对象本身——调用方保证语义，如战败清场）。 */
  removeAllOwnedObjects(): void {
    this.objectsByType.forEach((set) => set.clear());
    this.objectsById.clear();
  }

  /** 名下全部建筑（Set，含悬置者），常用于"是否还有建筑"战败判定。 */
  get buildings(): Set<any> {
    return this.getOrCreateObjectsForType(ObjectType.Building);
  }

  // ---- 生产与战斗统计（晋升经验、结算面板、AI 决策的数据源） ----

  /** 累计生产数量；buildLimit < 0 的单位另按名字限建计数。 */
  /**
   * 记录一次建成：按类型累加（getUnitsBuilt 的数据源）；buildLimit<0
   * 的单位同时按名字累加限建计数（生产队列用它拒绝超建）。
   */
  addUnitsBuilt(unitRules: any, count: number): void {
    this.unitsBuiltByType.set(unitRules.type, (this.unitsBuiltByType.get(unitRules.type) ?? 0) + count);
    if (unitRules.buildLimit < 0)
      this.limitedUnitsBuiltByName.set(
        unitRules.name,
        (this.limitedUnitsBuiltByName.get(unitRules.name) ?? 0) + count,
      );
  }

  /** 已建数量：传类型查单类；不传参返回全部类型总和。 */
  getUnitsBuilt(type?: any): number {
    return type !== undefined
      ? (this.unitsBuiltByType.get(type) ?? 0)
      : [...this.unitsBuiltByType.values()].reduce((a, b) => a + b, 0);
  }

  /** 按名字查限建单位的已建数量（未建过返回 0）。 */
  getLimitedUnitsBuilt(name: string): number {
    return this.limitedUnitsBuiltByName.get(name) ?? 0;
  }

  /** 累计击杀（按对方类型记，晋升与结算用）。 */
  addUnitsKilled(type: any, count: number): void {
    this.unitsKilledByType.set(type, (this.unitsKilledByType.get(type) ?? 0) + count);
  }

  /** 击杀查询：传类型查单类；不传参返回总和。 */
  getUnitsKilled(type?: any): number {
    return type !== undefined
      ? (this.unitsKilledByType.get(type) ?? 0)
      : [...this.unitsKilledByType.values()].reduce((a, b) => a + b, 0);
  }

  /** 累计损失（按己方类型记）。 */
  addUnitsLost(type: any, count: number): void {
    this.unitsLostByType.set(type, (this.unitsLostByType.get(type) ?? 0) + count);
  }

  /** 损失查询：传类型查单类；不传参返回总和。 */
  getUnitsLost(type?: any): number {
    return type !== undefined
      ? (this.unitsLostByType.get(type) ?? 0)
      : [...this.unitsLostByType.values()].reduce((a, b) => a + b, 0);
  }

  /** 是否仍在作战：非中立、非观察者、未战败。 */
  isCombatant(): boolean {
    return !this.isNeutral && !this.isObserver && !this.defeated;
  }

  /**
   * 该玩家能否让指定单位以老兵级出厂：
   * 生产设施自带相应老兵类型，或国家名单（Country.hasVeteranUnit）点名。
   * production/country 缺失（观察者、中立）直接抛错。
   */
  canProduceVeteran(unitRules: any): boolean {
    if (!this.production || !this.country) throw new Error("Non-combatants can't produce units");
    let queueType = this.production.getQueueTypeForObject(unitRules);
    queueType = this.production.getFactoryTypeForQueueType(queueType);
    return this.production.hasVeteranType(queueType) || this.country.hasVeteranUnit(unitRules.type, unitRules.name);
  }

  /** 锁步校验散列：资金 + 各玩家级 trait 散列的 FNV。 */
  getHash(): number {
    return fnv32a([this.credits, ...this.traits.getAll().map((trait) => trait.getHash?.() ?? 0)]);
  }

  /** 调试状态快照：名字 + 资金 + 各 trait 的可选调试状态（按类名索引）。 */
  debugGetState() {
    return {
      name: this.name,
      credits: this.credits,
      traits: this.traits.getAll().reduce((acc: any, trait) => {
        const state = trait.debugGetState?.();
        if (state !== undefined) acc[trait.constructor.name] = state;
        return acc;
      }, {}),
    };
  }

  /** 销毁：释放玩家级 trait 与生产队列（对局结束时调用）。 */
  dispose(): void {
    this.traits.dispose();
    this.production?.dispose();
  }
}
