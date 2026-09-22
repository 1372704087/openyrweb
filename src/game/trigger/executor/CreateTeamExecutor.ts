/**
 * CreateTeamExecutor — 建立小队动作。
 *
 * 动作 4 (RA2) / 76 (YR): CreateTeam — 按地图 [TeamTypes] 定义创建作战小队。
 * 参考临时源码（werhd.min.js @1705013 / @2751183）：
 *   - teamId 取 params[1]，空/"0"/"none"/"<none>" 视为无效；
 *   - 队伍归属阵营优先取 TeamType 自身的 House= 字段（其次触发器 houseName），
 *     再解析到对应 Player 的 AI 引擎（OriginalAiBot 的 AiEngine.spawnTeam）。
 * 引擎负责招募空闲单位（TaskForce）并执行脚本（ScriptType）。
 *
 * 由 game/trigger/executor/CreateTeamExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CreateTeamExecutor extends TriggerExecutor {
  /**
   * 解析阵营名/索引到 Player
   * （housePlayers 精确名 → [Houses] 数字索引 → 国家名 → 大小写不敏感 → 别名）。
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
   * 执行：优先 ScenarioTeamRuntime，否则在 AI 引擎中 spawnTeam。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const teamName = String(this.action.params[1] || "").trim();
    if (!teamName || "0" === teamName || /^(?:none|<none>)$/i.test(teamName)) {
      console.warn(`CreateTeam has no team id (${this.getDebugName()}).`);
      return;
    }
    // 战役队伍：优先走 ScenarioTeamRuntime 完整脚本执行路径（已移植 cQe 的
    // quarry 协调攻击 / 小队同步 / 特勤任务分流等）。地图 [TeamTypes] 中存在
    // 定义且能解析归属阵营时使用它；否则回退到 AiEngine。
    if (world.scenarioTeamRuntime) {
      const scenarioDef = world.scenarioTeamRuntime.getTeam(teamName);
      if (scenarioDef) {
        const scenarioOwner = this.resolveHousePlayer(world, scenarioDef.houseName);
        if (scenarioOwner) {
          try {
            if (world.scenarioTeamRuntime.createTeam(teamName, world.currentTick)) {
              console.warn(
                `[OpenYRWeb] CreateTeam: "${teamName}" (house=${scenarioDef.houseName}) via scenarioTeamRuntime @ tick ${world.currentTick} — trigger ${this.getDebugName()}`,
              );
              return;
            }
          } catch (err: any) {
            console.warn(`CreateTeam: scenarioTeamRuntime failed for "${teamName}": ${err?.message}`);
          }
        }
      }
    }
    // 战役队伍统一交给 AiEngine（ScenarioTeamBot，evaluateTriggers=false）执行。
    const bots = world.botManager && world.botManager.bots ? world.botManager.bots : void 0;
    let firstEngine: any;
    let botCount = 0;
    let parsedCount = 0;
    for (const [player, bot] of bots ? bots : []) {
      botCount++;
      const eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
      if (!eng || !eng.parsed) continue;
      parsedCount++;
      firstEngine || (firstEngine = eng);
      let tm = eng.parsed.teamTypes[teamName];
      if (!tm) {
        const lower = teamName.toLowerCase();
        tm = Object.keys(eng.parsed.teamTypes).reduce(
          (acc: any, k: string) => acc || (k.toLowerCase() === lower ? eng.parsed.teamTypes[k] : void 0),
          void 0,
        );
      }
      if (!tm) continue;
      // 归属阵营：TeamType.House= 优先，其次触发器 houseName
      const ownerName = (tm.house || this.trigger.houseName || "").toString().trim();
      const owner = this.resolveHousePlayer(world, ownerName);
      if (owner && owner !== player) continue;
      if (!owner && this.trigger.houseName && this.trigger.houseName.trim()) {
        // TeamType 未标注 House 时按触发器阵营匹配
        const tp = this.resolveHousePlayer(world, this.trigger.houseName);
        if (tp && tp !== player) continue;
      }
      eng.spawnTeam(tm, world.currentTick);
      console.warn(
        `[OpenYRWeb] CreateTeam: "${teamName}" (house=${ownerName || "?"}) via ${player.name} @ tick ${world.currentTick} — trigger ${this.getDebugName()}`,
      );
      return;
    }
    if (firstEngine) {
      console.warn(`TeamType "${teamName}" not found in any AI engine's map data.`);
      return;
    }
    console.warn(
      `No AI engine available for house "${this.trigger.houseName}" — cannot create team "${teamName}" ` +
        `(bots=${botCount}, parsed engines=${parsedCount}).`,
    );
  }
}
