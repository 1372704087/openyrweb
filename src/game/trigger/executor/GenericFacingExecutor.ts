/**
 * GenericFacingExecutor — 设置朝向动作。
 *
 * 动作 78: GenericFacing — 将触发阵营所有存活单位朝向设置为指定方向。
 * 参数：params[1] 为 0-7 方向（与脚本 ForceFacing 一致）。
 *
 * 由 game/trigger/executor/GenericFacingExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 角度换算 dir = (8 - (facing & 7)) % 8 * 45，与孪生运算优先级一致
 * （先按位与、再减、再取模、最后乘 45）。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GenericFacingExecutor extends TriggerExecutor {
  /**
   * 解析阵营名/索引到 Player（查找顺序与 CreateTeamExecutor 一致）。
   *
   * @param world 世界上下文。
   * @param name 阵营名或数字串。
   * @returns 匹配玩家或 undefined。
   */
  resolveHousePlayer(world: any, name: any): any {
    if (!name) return void 0;
    const s = String(name).trim();
    if (!s) return void 0;
    let p = world.housePlayers.get(s);
    if (p) return p;
    if (/^\d+$/.test(s)) {
      const h = world.campaignHouses && world.campaignHouses[Number(s)];
      if (h) p = world.housePlayers.get(h.name);
      if (p) return p;
    }
    p = world.getAllPlayers().find((q: any) => !q.defeated && q.country?.name === s);
    if (p) return p;
    const lower = s.toLowerCase();
    for (const [k, v] of world.housePlayers) if (k.toLowerCase() === lower) return v;
    p = world
      .getAllPlayers()
      .find(
        (q: any) =>
          q.name === s ||
          (q.scenarioAliases || []).some((a: any) => String(a).toLowerCase() === lower),
      );
    return p;
  }

  /**
   * 执行：把归属阵营全部存活单位方向设为指定角度。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const facing = Number(this.action.params[1]) || 0;
    const dir = ((8 - (facing & 7)) % 8) * 45;
    const owner = this.resolveHousePlayer(world, this.trigger.houseName);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    let count = 0;
    for (const obj of owner.getOwnedObjects()) {
      if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed) continue;
      obj.direction = dir;
      obj.spinVelocity = 0;
      count++;
    }
    console.warn(`[OpenYRWeb] GenericFacing: ${owner.name}, set ${count} unit(s) to facing ${dir}`);
  }
}
