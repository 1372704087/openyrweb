/**
 * BuildingExistsCondition — 阵营是否拥有指定类型建筑。
 *
 * 事件 BuildingExists（negate=false）/ BuildingNotExists（工厂传 negate=true）。
 * 按 rules.index 匹配玩家 buildings 集合；无 player 时恒 false（取反场景亦 false）。
 *
 * 由 game/trigger/condition/BuildingExistsCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class BuildingExistsCondition extends TriggerCondition {
  /** true 表示「建筑不存在」语义（BuildingNotExists）。 */
  readonly negate: boolean;
  /** 目标建筑 rules.index。 */
  readonly objectIndex: number;

  constructor(event: any, trigger: any, negate = false) {
    super(event, trigger);
    this.negate = negate;
    this.objectIndex = Number(event.params[1]);
  }

  check(): boolean {
    if (!this.player) return false;
    for (const b of this.player.buildings) {
      if (b.rules.index === this.objectIndex) return !this.negate;
    }
    return this.negate;
  }
}
