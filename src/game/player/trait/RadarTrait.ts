/**
 * RadarTrait — 玩家雷达开关状态（挂在 Player 上的轻量镜像）。
 *
 * 仅维护 disabled 布尔与 activeEvents 列表；完整的雷达可用性计算在
 * game/trait/RadarTrait。PlayerFactory 创建玩家时实例化并 add 到
 * player.traits，观察者创建后立即 setDisabled(false) 的反面——实际
 * 调用 setDisabled(!1) 即不禁用（允许观察者看雷达）。
 *
 * 由 game/player/trait/RadarTrait.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RadarTrait {
  /** 雷达是否被禁用（构造时默认禁用）。 */
  disabled: boolean;
  /** 进行中的雷达相关事件列表。 */
  activeEvents: any[];

  constructor() {
    this.disabled = true;
    this.activeEvents = [];
  }

  /** 是否处于禁用状态。 */
  isDisabled(): boolean {
    return this.disabled;
  }

  /** 设置禁用状态。 */
  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }
}
