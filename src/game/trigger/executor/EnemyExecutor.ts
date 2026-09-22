/**
 * EnemyExecutor — 解除与指定阵营的联盟（动作 38 Enemy/MakeEnemy）。
 *
 * houseId = params[1]（-1=任意）。resolveSource 取触发器 houseName
 * 对应玩家；resolveTarget 按 -1 / country.id / campaignHouses 兜底。
 * execute：双方存在且不同、当前同盟时 breakAlliance 并派发
 * onAllianceChange，console.warn 记录 Broken。
 *
 * 由 game/trigger/executor/EnemyExecutor.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { Alliances } from "game/Alliances"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnemyExecutor extends TriggerExecutor {
  /** 目标阵营 country.id（params[1]，-1=任意）。 */
  houseId: number;

  constructor(action: any, trigger: any) {
    super(action, trigger);
    this.houseId = Number(action.params[1]);
  }

  /** 触发器所属阵营（[Triggers] 行首的 HouseName）。 */
  resolveSource(world: any): any {
    const name = this.trigger.houseName;
    if (!name) return undefined;
    return world.housePlayers.get(name) || world.getAllPlayers().find((p: any) => p.country?.name === name);
  }

  /** 目标阵营：-1 任意；country.id → [Houses] 索引 → 13+索引。 */
  resolveTarget(world: any, source: any): any {
    if (this.houseId === -1) return world.getAllPlayers().find((p: any) => p !== source);
    let player = world.getAllPlayers().find((p: any) => p.country?.id === this.houseId);
    if (!player && world.campaignHouses) {
      const h = world.campaignHouses[this.houseId] ?? world.campaignHouses[this.houseId - 13];
      if (h) player = world.housePlayers.get(h.name);
    }
    return player;
  }

  /** 若双方当前同盟则解除并广播变化。 */
  execute(world: any): void {
    const source = this.resolveSource(world);
    const target = this.resolveTarget(world, source);
    if (!source || !target || source === target) return;
    if (!world.alliances.areAllied(source, target)) return;
    const entry = world.alliances.findByPlayers(source, target);
    world.alliances.breakAlliance(source, target);
    world.onAllianceChange(entry, source, false);
    console.warn(`[OpenYRWeb] Enemy: ${source.name} vs ${target.name} (Broken)`);
  }
}
