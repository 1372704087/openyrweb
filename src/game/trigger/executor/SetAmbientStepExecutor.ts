/**
 * SetAmbientStepExecutor — 设置环境光每步变化量。
 *
 * params[1] 经 util/number.int32ToFloat32 转换后写入
 * mapLightingTrait.setAmbientChangeStep。
 *
 * 由 game/trigger/executor/SetAmbientStepExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NumberModule from "util/number"; // 未转换（any-shim）
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SetAmbientStepExecutor extends TriggerExecutor {
  /** 按 int32ToFloat32(params[1]) 写入环境光步进。 */
  execute(world: any): void {
    const step = (NumberModule as any).int32ToFloat32(Number(this.action.params[1]));
    world.mapLightingTrait.setAmbientChangeStep(step);
  }
}
