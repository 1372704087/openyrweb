/**
 * FireSaleExecutor — 强制抛售指定阵营全部建筑。
 *
 * 动作 FireSale：params[1]=国家 id；对匹配玩家 buildings 逐个 sellTrait.sell。
 *
 * 由 game/trigger/executor/FireSaleExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FireSaleExecutor extends TriggerExecutor {
  /** 目标阵营国家 id。 */
  readonly houseId: number;

  constructor(action: any, trigger: any) {
    super(action, trigger);
    this.houseId = Number(action.params[1]);
  }

  execute(game: any): void {
    const player = game.getAllPlayers().find((p) => p.country?.id === this.houseId);
    if (!player) return;
    for (const b of player.buildings) {
      game.sellTrait.sell(b);
    }
  }
}
