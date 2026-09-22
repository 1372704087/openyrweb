/**
 * WinLoseExecutor — 宣告胜负动作。
 *
 * 动作 1 Win(胜利者是…) / 2 Lose(失败者是…) / 67 DeclareWinning / 68 DeclareLosing。
 * 参数: params[0] = 目标阵营索引（地图 [Houses] 顺序）。
 *   Win   → 目标阵营获胜，其余非中立阵营判负，结束游戏。
 *   Lose  → 目标阵营判负，结束游戏。
 * 游戏结束画面根据 localPlayer.defeated 显示胜利/失败（见 ScoreTable）。
 *
 * 由 game/trigger/executor/WinLoseExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WinLoseExecutor extends TriggerExecutor {
  /** true=宣告胜利路径，false=宣告失败路径。 */
  win: boolean;

  constructor(action: any, trigger: any, win: boolean) {
    super(action, trigger);
    this.win = !!win;
  }

  /**
   * 执行：按 win 标志设置阵营 defeated 并结束游戏。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const idx = Number(this.action.params[0]);
    const house = world.campaignHouses ? world.campaignHouses[idx] : void 0;
    const player = house ? world.housePlayers.get(house.name) : void 0;
    console.warn(
      `[OpenYRWeb] WinLose: ${this.win ? "Win" : "Lose"} idx=${idx} house=${house?.name} player=${player?.name}`,
    );
    if (!player) {
      console.warn(`Invalid house index ${idx} for action ${this.getDebugName()}.`);
      return;
    }
    if (this.win) {
      // 目标阵营获胜：其余非中立阵营判负
      for (const p of world.getAllPlayers())
        if (p !== player && !p.isNeutral && !p.isObserver) p.defeated = !0;
    } else {
      player.defeated = !0;
    }
    world.end();
  }
}
