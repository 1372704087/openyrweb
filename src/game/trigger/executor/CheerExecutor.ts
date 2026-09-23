/**
 * CheerExecutor — 让阵营步兵欢呼。
 *
 * 按 houseId（params[1]，-1=任意）选第一个匹配且未败北的阵营，
 * 对其空闲步兵 addTask(CheerTask)。
 *
 * 由 game/trigger/executor/CheerExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { CheerTask } from "game/gameobject/task/CheerTask"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CheerExecutor extends TriggerExecutor {
  /** 目标阵营国家 id；-1 = 任意。 */
  readonly houseId: number;

  constructor(action: any, trigger: any) {
    super(action, trigger);
    this.houseId = Number(action.params[1]);
  }

  execute(game: any): void {
    let players = game.getAllPlayers().filter((p) => p.country && !p.defeated);
    if (this.houseId !== -1) {
      players = players.filter((p) => p.country?.id === this.houseId);
    }
    if (!players.length) return;
    for (const inf of players[0].getOwnedObjectsByType(ObjectType.Infantry)) {
      if (inf.unitOrderTrait.isIdle()) {
        inf.unitOrderTrait.addTask(new CheerTask());
      }
    }
  }
}
