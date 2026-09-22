/**
 * CreateCrateExecutor — 创建箱子动作。
 *
 * 动作 108: CreateCrate — 按 params[1] 类型在路径点 params[6] 生成箱子；
 * 未知类型则随机箱子。类型表把 0-18 映射到 PowerupType 或自定义函数。
 *
 * 由 game/trigger/executor/CreateCrateExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）
import * as PowerupTypeModule from "game/type/PowerupType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
const PowerupType: any = (PowerupTypeModule as any).PowerupType;

/**
 * params[1] → powerup 解析表。
 * 值为 PowerupType 则在规则里按 type 查找；值为函数则由世界计算条目；
 * undefined 表示该编号不生成。0 号为定制：Money 条目 data 改写为 "5000"。
 */
const CRATE_TYPE_MAP: Map<number, any> = new Map([
  [
    0,
    (world: any) => {
      const t = world.rules.powerups.powerups.find((p: any) => p.type === PowerupType.Money);
      return t ? { ...t, data: "5000" } : void 0;
    },
  ],
  [1, PowerupType.Unit],
  [2, PowerupType.HealBase],
  [3, PowerupType.Cloak],
  [4, PowerupType.Explosion],
  [5, PowerupType.Napalm],
  [6, PowerupType.Money],
  [7, PowerupType.Darkness],
  [8, PowerupType.Reveal],
  [9, PowerupType.Armor],
  [10, PowerupType.Speed],
  [11, PowerupType.Firepower],
  [12, PowerupType.ICBM],
  [13, void 0],
  [14, PowerupType.Veteran],
  [15, void 0],
  [16, PowerupType.Gas],
  [17, PowerupType.Tiberium],
  [18, void 0],
]);

/** 创建箱子执行器。 */
export class CreateCrateExecutor extends TriggerExecutor {
  /**
   * 执行：在路径点生成指定类型或随机箱子。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const crateType = Number(this.action.params[1]);
    const waypoint = this.action.params[6];
    const cratesAppear = world.gameOpts.cratesAppear;
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    if (CRATE_TYPE_MAP.has(crateType)) {
      const mapped = CRATE_TYPE_MAP.get(crateType);
      const resolved =
        "function" == typeof mapped
          ? mapped(world)
          : world.rules.powerups.powerups.find((p: any) => p.type === mapped);
      if (resolved) world.crateGeneratorTrait.spawnCrateAt(tile, resolved, world, 3, cratesAppear);
    } else {
      world.crateGeneratorTrait.spawnRandomCrateAt(tile, world, 3, cratesAppear);
    }
  }
}
