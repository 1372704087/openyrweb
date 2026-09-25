/**
 * PoweredTrait — 建筑电力开关（turnedOn / charged / 低电 / 飞碟吸电）。
 *
 * isPoweredOn 判定顺序：
 *  1. 被 Floating Disc 吸电（drainedBy 且非精炼厂）→ 断电；
 *  2. 未 turnedOn → 断电；
 *  3. forceOn=true 跳过充电检查，否则需 hasChargersToPowerOn（超载建筑）；
 *  4. 无 Power 且需工程师占领的建筑：中立阵营视为无电；
 *  5. 否则看玩家 powerTrait.level !== Low。
 *
 * 由 game/gameobject/trait/PoweredTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as PowerTraitModule from "game/player/trait/PowerTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PoweredTrait {
  /** 所属建筑对象。 */
  obj: any;
  /** 手动开关（默认开）。 */
  turnedOn: any;

  constructor(obj: any) {
    this.obj = obj;
    this.turnedOn = true;
  }

  /** 设置手动开关。 */
  setTurnedOn(v: any) {
    this.turnedOn = v;
  }

  /** 是否有超载充电体可维持供电。 */
  isCharged() {
    return !!this.obj.isBuilding() && !!this.obj.overpoweredTrait?.hasChargersToPowerOn();
  }

  /**
   * 是否处于通电状态。
   * @param forceOn 跳过充电体检查（超载建筑强制判定玩家电力）
   */
  isPoweredOn(forceOn = false) {
    // 被飞碟吸电的建筑在吸附期间视为断电（原版禁用防御塔/电厂；
    // 精炼厂/奴隶矿车不受影响）。飞碟重新索敌/死亡时清除 drainedBy。
    if (this.obj && this.obj.drainedBy && !this.obj.rules.refinery) return false;
    return (
      !!this.obj &&
      !!this.turnedOn &&
      (forceOn || !this.isCharged()
        ? !this.obj.rules.power && this.obj.rules.needsEngineer
          ? !this.obj.owner.isNeutral
          : !!this.obj.owner.powerTrait && this.obj.owner.powerTrait?.level !== PowerTraitModule.PowerLevel.Low
        : true)
    );
  }

  /** 释放对象引用。 */
  dispose() {
    this.obj = undefined;
  }
}
