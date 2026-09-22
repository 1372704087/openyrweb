/**
 * LowPowerCondition — 指定阵营处于低电力状态条件。
 *
 * 由 game/trigger/condition/LowPowerCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.LowPower=30：houseId 取 params[1]；init 在
 * 基类解析后按国家 id 再找 targetPlayer；check 看其 powerTrait 低电。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LowPowerCondition extends TriggerCondition {
  /** 目标阵营国家 id（params[1]）。 */
  houseId: number;
  /** init 按 country.id 解析到的玩家。 */
  targetPlayer: any;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1]);
  }

  /**
   * 初始化：基类按 houseName 找 player，再按 houseId 找 targetPlayer。
   *
   * @param world 提供 getAllPlayers() 的世界上下文。
   */
  init(world: any): void {
    super.init(world);
    this.targetPlayer = world.getAllPlayers().find((p: any) => p.country?.id === this.houseId);
  }

  /**
   * 检查是否低电。
   *
   * @returns targetPlayer.powerTrait.isLowPower() 为真时 true。
   */
  check(): boolean {
    return !!this.targetPlayer?.powerTrait?.isLowPower();
  }
}
