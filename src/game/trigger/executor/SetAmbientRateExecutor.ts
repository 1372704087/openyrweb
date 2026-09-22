/**
 * SetAmbientRateExecutor — 设置环境光变化速率。
 *
 * 动作 SetAmbientRate：params[1] 经 int32ToFloat32 位模式转换为浮点速率，
 * 写入 mapLightingTrait.setAmbientChangeRate。
 *
 * 由 game/trigger/executor/SetAmbientRateExecutor.ts.js 重写为 TS。
 */
import * as NumberModule from "util/number"; // 未转换（any-shim）
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SetAmbientRateExecutor extends TriggerExecutor {
  execute(game: any): void {
    const rate = (NumberModule as any).int32ToFloat32(Number(this.action.params[1]));
    game.mapLightingTrait.setAmbientChangeRate(rate);
  }
}
