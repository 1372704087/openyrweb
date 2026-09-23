/**
 * MoveCameraExecutor — 移动并居中视野。
 *
 * 动作 48 (MoveAndCenterView)：将玩家视野平滑移动到指定路径点。
 * 参考临时源码（werhd.min.js @2653200）：moveCameraToWaypoint 平滑插值。
 * 实现：设置 game.pendingCameraMove，GUI 层轮询消费并驱动相机动画。
 * 路径点参数在 params[6]（AZ 编码，readActions 已转成编号），速度在 params[1]。
 *
 * 由 game/trigger/executor/MoveCameraExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveCameraExecutor extends TriggerExecutor {
  execute(game: any): void {
    const wp = Number(this.action.params[6]);
    if (!game.map.getTileAtWaypoint(wp)) {
      console.warn(`MoveAndCenterView has invalid waypoint ${wp} (${this.getDebugName()}).`);
      return;
    }
    game.pendingCameraMove = { waypoint: wp, speed: Number(this.action.params[1]) || 1 };
    console.debug(`[OpenYRWeb] MoveAndCenterView: pan to waypoint ${wp} (${this.getDebugName()}).`);
  }
}
