/**
 * BlackoutRadarExecutor — 雷达黑屏动作。
 *
 * 动作 139: BlackoutRadar — 使触发阵营的雷达暂时失效。
 *
 * 由 game/trigger/executor/BlackoutRadarExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1] 为真且非 "0" 时 disabled=true（缺省/空串也视为 true，
 * 与孪生 `!params[1] || Number(params[1]) !== 0` 一致）。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BlackoutRadarExecutor extends TriggerExecutor {
  /**
   * 解析阵营名/索引到 Player。
   *
   * 查找顺序（与孪生一致）：housePlayers 精确名 → [Houses] 数字索引 →
   * 未战败国家名 → 大小写不敏感 housePlayers → 玩家名/scenarioAliases。
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
   * 执行：切换归属玩家雷达禁用状态。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const owner = this.resolveHousePlayer(world, this.trigger.houseName);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    const disabled = !this.action.params[1] || Number(this.action.params[1]) !== 0;
    if (owner.radarTrait) {
      owner.radarTrait.setDisabled(disabled);
      console.warn(`[OpenYRWeb] BlackoutRadar: ${owner.name} radar disabled=${disabled}`);
    } else {
      console.warn(`[OpenYRWeb] BlackoutRadar: ${owner.name} has no radarTrait — no-op.`);
    }
  }
}
