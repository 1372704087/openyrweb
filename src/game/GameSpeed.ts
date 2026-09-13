/**
 * GameSpeed — 游戏速度档位换算。
 *
 * 由 game/GameSpeed.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class GameSpeed {
  /** 模拟基础帧率：每现实秒 15 逻辑 tick。 */
  static readonly BASE_TICKS_PER_SECOND = 15;

  /**
   * 速度档位（1-6）→ 每 tick 的现实秒数。
   * 档位 6 = 1/4 秒，档位 5 = 3/4 秒，其余按 60/(6-档位) 游戏秒换算。
   */
  static computeGameSpeed(speed: number): number {
    let ticks: number;
    ticks = speed === 6 ? 60 : speed === 5 ? 45 : 60 / (6 - speed);
    return ticks / GameSpeed.BASE_TICKS_PER_SECOND;
  }
}
