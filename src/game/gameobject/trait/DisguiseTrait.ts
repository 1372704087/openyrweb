/**
 * DisguiseTrait — 变形/伪装 trait（Mirage / 恐怖机器人等）。
 *
 * 单位可伪装成另一对象（rules+owner 快照）：
 *  - disguiseAs：立即伪装并派发 ObjectDisguiseChangeEvent；
 *  - revealDisguise：解除伪装并进入冷却（infantryBlinkDisguiseTime）；
 *  - permaDisguise 出生时按阵营取默认步兵伪装（allied/soviet/third）；
 *  - 每 tick：非永久伪装下，开火（JustFired）或移动即解除；冷却倒数
 *    归零后若 disguiseWhenStill 则随机伪装成默认地形之一；
 *  - 受击（onDamage）立即解除。
 *
 * 由 game/gameobject/trait/DisguiseTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import * as ObjectDisguiseChangeEventModule from "game/event/ObjectDisguiseChangeEvent"; // 孪生
import { SideType } from "game/SideType"; // 孪生
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 本组新写
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换

export class DisguiseTrait {
  /** 伪装是否生效。 */
  isActive: boolean;
  /** 解除伪装后的冷却剩余 tick（冷却中不可自动再伪装）。 */
  cooldownTicks: number;
  /** 当前伪装成的对象快照（rules+owner）。 */
  disguisedAs?: { rules: any; owner?: any };

  constructor() {
    this.isActive = false;
    this.cooldownTicks = 0;
  }

  /** 是否处于伪装状态。 */
  isDisguised(): boolean {
    return this.isActive;
  }

  /** 返回伪装快照；未激活时 undefined。 */
  getDisguise() {
    return this.isActive ? this.disguisedAs : undefined;
  }

  /** 伪装对象是否为地形（Terrain）。 */
  hasTerrainDisguise(): boolean {
    return this.getDisguise()?.rules.type === ObjectType.Terrain;
  }

  /** 伪装成目标对象（快照 rules+owner），激活并派发变化事件。 */
  disguiseAs(target: any, self: any, world: any): void {
    this.disguisedAs = { rules: target.rules, owner: target.owner };
    this.isActive = true;
    world.events.dispatch(new ObjectDisguiseChangeEventModule.ObjectDisguiseChangeEvent(self));
  }

  /** 解除伪装：进入冷却、取消激活、派发变化事件。 */
  revealDisguise(self: any, world: any): void {
    this.cooldownTicks = world.rules.general.infantryBlinkDisguiseTime;
    this.isActive = false;
    world.events.dispatch(new ObjectDisguiseChangeEventModule.ObjectDisguiseChangeEvent(self));
  }

  /**
   * 出生：若未有伪装且规则 permaDisguise、是步兵、owner 有国家阵营，
   * 则按阵营取默认步兵伪装（allied/soviet/third）并立即激活。
   */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (
      !this.disguisedAs &&
      object.rules.permaDisguise &&
      object.isInfantry() &&
      object.owner.country
    ) {
      const typeName = this.getDefaultInfantryDisguise(object.owner.country.side, world.rules.general);
      if (typeName) {
        const rules = world.rules.getObject(typeName, ObjectType.Infantry);
        this.disguisedAs = { rules, owner: object.owner };
        this.isActive = true;
      }
    }
  }

  /** 阵营 → 默认步兵伪装类型名（GDI→allied、Nod→soviet、Third→third）。 */
  getDefaultInfantryDisguise(side: number, general: any): string | undefined {
    switch (side) {
      case SideType.GDI:
        return general.alliedDisguise;
      case SideType.Nod:
        return general.sovietDisguise;
      case SideType.ThirdSide:
        return general.thirdDisguise;
      default:
        return undefined;
    }
  }

  /**
   * 每 tick 维持伪装状态机（permaDisguise 跳过）：
   *  - 开火（JustFired）或非 Idle 移动 → 立即解除；
   *  - 否则冷却中则递减；
   *  - 否则未激活且 disguiseWhenStill → 随机选默认地形伪装并激活。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (object.rules.permaDisguise) return;
    if (
      object.attackTrait?.attackState === AttackState.JustFired ||
      object.moveTrait.moveState !== MoveState.Idle
    ) {
      this.revealDisguise(object, world);
    } else if (0 < this.cooldownTicks) {
      this.cooldownTicks--;
    } else if (!this.isActive && object.rules.disguiseWhenStill) {
      this.isActive = true;
      this.disguisedAs = { rules: this.selectRandomMirageDisguise(world), owner: undefined };
      world.events.dispatch(new ObjectDisguiseChangeEventModule.ObjectDisguiseChangeEvent(object));
    }
  }

  /** 受击立即解除伪装。 */
  [NotifyDamageModule.NotifyDamage.onDamage](object: any, world: any): void {
    this.revealDisguise(object, world);
  }

  /** 从 general.defaultMirageDisguises 随机取一条，按 Terrain 解析规则对象。 */
  selectRandomMirageDisguise(world: any): any {
    let list = world.rules.general.defaultMirageDisguises;
    if (!list.length) throw new Error("No default mirage disguises are defined");
    list = list[world.generateRandomInt(0, list.length - 1)];
    return world.rules.getObject(list, ObjectType.Terrain);
  }
}
