/**
 * DestroyTagExecutor — 销毁标签动作。
 *
 * 动作 70: DestroyTag — 按标签 ID 删除地图标签绑定。
 *
 * 由 game/trigger/executor/DestroyTagExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1] = 标签 ID。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyTagExecutor extends TriggerExecutor {
  /**
   * 执行：调用 triggers.destroyTag(params[1])。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const tagId = this.action.params[1];
    world.triggers.destroyTag(tagId);
  }
}
