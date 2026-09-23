/**
 * GameObject — 所有游戏对象（单位/建筑/地形/弹丸/碎片…）的基类。
 *
 * 职责：
 *  - 持有类型标识（ObjectType）与 INI 规则/美术配置引用；
 *  - 管理 trait 容器，并按 Symbol 通知接口（NotifyTick/NotifySpawn/…）
 *    把生命周期事件广播给订阅的 trait；
 *  - 维护模拟状态标志（isSpawned / isDestroyed / isDisposed / deathType）。
 *
 * 位置（position）与对象 id 由工厂/子类注入，基类只读转发。
 * 每逻辑 tick 的 update() 只遍历 cachedTraits.tick 缓存（addTrait 时登记），
 * 避免每帧全量过滤 trait。
 *
 * 由 game/gameobject/GameObject.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。注意：onAttack 分发时两个实参顺序对调（忠实保留原实现）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import { Traits } from "game/Traits";
import { NotifyTick } from "game/gameobject/trait/interface/NotifyTick";
import { NotifyDestroy } from "game/gameobject/trait/interface/NotifyDestroy";
import { NotifyOwnerChange } from "game/gameobject/trait/interface/NotifyOwnerChange";
import { NotifySpawn } from "game/gameobject/trait/interface/NotifySpawn";
import { NotifyUnspawn } from "game/gameobject/trait/interface/NotifyUnspawn";
import { NotifyAttack } from "game/gameobject/trait/interface/NotifyAttack";
import { fnv32a } from "util/math";
import { DeathType } from "game/gameobject/common/DeathType";
import type { ObjectPosition } from "game/gameobject/ObjectPosition";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameObject {
  /** 对象类型（ObjectType 枚举），决定其在对象体系中的类别。 */
  type: ObjectType;
  /** INI 内部名（如 "GI"、"GAWALL"）。 */
  name: string;
  /** INI 规则对象（rules），字段结构由规则层定义（未转换前为 any）。 */
  rules: any;
  /** INI 美术对象（art）。 */
  art: any;
  /** trait 容器（见 game/Traits）。 */
  traits: Traits;
  /** 每 tick 需要被调用的 trait 缓存，addTrait() 时登记。 */
  cachedTraits: { tick: any[] };
  /** 对象 id，工厂分配（锁步两端一致）。 */
  id: number;
  /** 位置组件，工厂注入。 */
  position: ObjectPosition;
  /** 正在坠毁中（飞行器/载具被击落后尚未落地）。 */
  isCrashing: boolean;
  /** 已被摧毁（尸体/残骸阶段）。 */
  isDestroyed: boolean;
  /** 死亡表现分类（见 DeathType）。 */
  deathType: DeathType;
  /** 已销毁（trait 全部释放，不可再用）。 */
  isDisposed: boolean;
  /** 是否已进入战场（onSpawn 之后）。 */
  isSpawned: boolean;

  constructor(type: ObjectType, name: string, rules: any, art: any) {
    this.traits = new Traits();
    this.cachedTraits = { tick: [] };
    this.isCrashing = false;
    this.isDestroyed = false;
    this.deathType = DeathType.Normal;
    this.isDisposed = false;
    this.isSpawned = false;
    this.type = type;
    this.name = name;
    this.rules = rules;
    this.art = art;
  }

  // ---- 位置快捷访问（实际状态在 position 组件上） ----

  get tile(): any {
    return this.position.tile;
  }

  get tileElevation(): number {
    return this.position.tileElevation;
  }

  // ---- 类型判定（基类一律 false，由具体子类覆写） ----

  getFoundation(): { width: number; height: number } {
    return { width: 1, height: 1 };
  }

  isSmudge(): boolean {
    return this.type === ObjectType.Smudge;
  }

  isOverlay(): boolean {
    return this.type === ObjectType.Overlay;
  }

  isTerrain(): boolean {
    return this.type === ObjectType.Terrain;
  }

  isProjectile(): boolean {
    return this.type === ObjectType.Projectile;
  }

  isDebris(): boolean {
    return this.type === ObjectType.Debris;
  }

  isBuilding(): boolean {
    return false;
  }

  isInfantry(): boolean {
    return false;
  }

  isVehicle(): boolean {
    return false;
  }

  isAircraft(): boolean {
    return false;
  }

  /** 是否为可移动单位（载具/步兵）。 */
  isUnit(): boolean {
    return false;
  }

  /** 是否为 techno（受战斗规则约束的单位/建筑统称）。 */
  isTechno(): boolean {
    return false;
  }

  // ---- 生命周期与 trait 广播 ----

  /** 每逻辑 tick 调用：驱动所有实现 NotifyTick.onTick 的 trait。 */
  update(world: any): void {
    for (const trait of this.cachedTraits.tick) trait[NotifyTick.onTick](this, world);
  }

  /** 进入战场：标记并通知所有 NotifySpawn trait。 */
  onSpawn(world: any): void {
    this.isSpawned = true;
    this.traits.filter(NotifySpawn).forEach((trait) => {
      trait[NotifySpawn.onSpawn](this, world);
    });
  }

  /** 离开战场：标记并通知所有 NotifyUnspawn trait。 */
  onUnspawn(world: any): void {
    this.isSpawned = false;
    this.traits.filter(NotifyUnspawn).forEach((trait) => {
      trait[NotifyUnspawn.onUnspawn](this, world);
    });
  }

  /** 被摧毁（死亡瞬间）：通知所有 NotifyDestroy trait。 */
  onDestroy(damage: any, warhead: any, attacker: any): void {
    this.traits.filter(NotifyDestroy).forEach((trait) => {
      trait[NotifyDestroy.onDestroy](this, damage, warhead, attacker);
    });
  }

  /** 所属玩家变更（渗透/占领等）：通知所有 NotifyOwnerChange trait。 */
  onOwnerChange(oldOwner: any, newOwner: any): void {
    this.traits.filter(NotifyOwnerChange).forEach((trait) => {
      trait[NotifyOwnerChange.onChange](this, oldOwner, newOwner);
    });
  }

  /**
   * 发起攻击：通知所有 NotifyAttack trait。
   * 注意：原实现分发时把 (attacker 侧对象, 目标) 两实参顺序对调为
   * (this, target, source) —— 此处忠实保留该顺序。
   */
  onAttack(source: any, target: any): void {
    this.traits.filter(NotifyAttack).forEach((trait) => {
      trait[NotifyAttack.onAttack](this, target, source);
    });
  }

  /** 挂载 trait；若其实现 NotifyTick 则同时登记进 tick 缓存。 */
  addTrait(trait: any): void {
    this.traits.add(trait);
    if (trait[NotifyTick.onTick]) this.cachedTraits.tick.push(trait);
  }

  // ---- 展示与序列化辅助 ----

  /** UI 显示名（rules.UIName，可能是本地化键）。 */
  getUiName(): string {
    return this.rules.uiName;
  }

  /** 锁步校验散列：id + 世界坐标字节 + 各 trait 散列的 FNV。 */
  getHash(): number {
    const worldPosition = this.position.worldPosition;
    return fnv32a([
      this.id,
      ...new Uint8Array(new Float64Array([worldPosition.x || 0, worldPosition.y || 0, worldPosition.z || 0]).buffer),
      ...this.traits.getAll().map((trait) => trait.getHash?.() ?? 0),
    ]);
  }

  /** 调试状态快照：id + 位置 + 各 trait 的可选调试状态。 */
  debugGetState() {
    return {
      id: this.id,
      position: this.position.worldPosition.toArray(),
      traits: this.traits.getAll().reduce((acc: any, trait) => {
        const state = trait.debugGetState?.();
        if (state !== undefined) acc[trait.constructor.name] = state;
        return acc;
      }, {}),
    };
  }

  /** 销毁：释放全部 trait 并清空 tick 缓存（对象此后不可再用）。 */
  dispose(): void {
    this.isDisposed = true;
    this.traits.dispose();
    this.cachedTraits.tick.length = 0;
  }
}
