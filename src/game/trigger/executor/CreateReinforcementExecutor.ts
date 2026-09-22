/**
 * CreateReinforcementExecutor — 插入增援动作。
 *
 * 动作 7 CreateReinforcement / 75 ReinforceTeam — 按地图 [TeamTypes]/[TaskForces]
 * 直接生成单位到指定路径点（不经过招募），并把生成单位交给 AI 引擎执行脚本。
 * 参考临时源码（werhd.min.js @2760481 reinforceTeam / @2795037 spawnTaskForce）：
 *   - teamId 在 params[1]，路径点在 params[6]；
 *   - 运输载具先装载可容纳乘员，再统一生成；
 *   - 步兵子格交错放置，生成位置在路径点附近查找可通行格。
 *
 * 执行优先级状态机：
 *  A. scenarioTeamRuntime.getTeam(teamName) 命中 → spawnTaskForce + startInstance；
 *     startInstance 失败则回退该 owner 的 AI 引擎 spawnTeamWithUnits
 *  B. 遍历全部已 parse 的 AI 引擎：按 TeamType.House / trigger.houseName
 *     归属过滤 → 找 TaskForce → 生成单位/装载/落地 → spawnTeamWithUnits
 *  C. 无可用引擎 / 无 TeamType → warn
 *
 * 由 game/trigger/executor/CreateReinforcementExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CreateReinforcementExecutor extends TriggerExecutor {
  /** 解析 HouseName → Player（与 CreateTeamExecutor 同一套规则）。 */
  private resolveHousePlayer(game: any, name: any): any {
    if (!name) return undefined;
    const s = String(name).trim();
    if (!s) return undefined;
    let p = game.housePlayers.get(s);
    if (p) return p;
    if (/^\d+$/.test(s)) {
      const h = game.campaignHouses && game.campaignHouses[Number(s)];
      if (h) p = game.housePlayers.get(h.name);
      if (p) return p;
    }
    p = game.getAllPlayers().find((q) => !q.defeated && q.country?.name === s);
    if (p) return p;
    const lower = s.toLowerCase();
    for (const [k, v] of game.housePlayers) {
      if (k.toLowerCase() === lower) return v;
    }
    p = game.getAllPlayers().find(
      (q) => q.name === s || (q.scenarioAliases || []).some((a) => String(a).toLowerCase() === lower),
    );
    return p;
  }

  /** 按 TeamType 名在 AI 引擎 parsed 数据中查找（大小写不敏感回退）。 */
  private findTeamType(eng: any, teamName: string): any {
    if (!eng || !eng.parsed) return undefined;
    const tm = eng.parsed.teamTypes[teamName];
    if (tm) return tm;
    const lower = String(teamName).toLowerCase();
    return Object.keys(eng.parsed.teamTypes).reduce(
      (acc, k) => acc || (k.toLowerCase() === lower ? eng.parsed.teamTypes[k] : undefined),
      undefined,
    );
  }

  /** 探测单位 rules 的 ObjectType；未找到抛错（与孪生一致）。 */
  private findObjectType(game: any, name: string): any {
    for (const type of [ObjectType.Infantry, ObjectType.Vehicle, ObjectType.Aircraft]) {
      if (game.rules.hasObject(name, type)) return type;
    }
    throw new Error(`Scenario unit rules "${name}" were not found`);
  }

  /** 路径点附近找未占用且可通行的落点；失败回退 startTile。 */
  private findReinforcementSpawnTile(game: any, unit: any, startTile: any, used: Set<any>): any {
    try {
      if (!game.map.tiles || !game.map.mapBounds || !game.map.terrain || unit.rules.speedType === undefined) {
        return startTile;
      }
      const finder = new RadialTileFinder(
        game.map.tiles,
        game.map.mapBounds,
        startTile,
        { width: 1, height: 1 },
        0,
        8,
        (tile) =>
          !used.has(tile) &&
          (unit.isAircraft() ||
            game.map.terrain.getPassableSpeed(tile, unit.rules.speedType, unit.isInfantry(), false) > 0),
        false,
      );
      return finder.getNextTile() ?? startTile;
    } catch (_) {
      return startTile;
    }
  }

  execute(game: any): void {
    const teamName = String(this.action.params[1] || "").trim();
    if (!teamName || teamName === "0" || /^(?:none|<none>)$/i.test(teamName)) {
      console.warn(`CreateReinforcement has no team id (${this.getDebugName()}).`);
      return;
    }
    const waypoint = Number(this.action.params[6]) || 0;
    const waypointTile = game.map.getTileAtWaypoint(waypoint);
    if (!waypointTile) {
      console.warn(
        `CreateReinforcement: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`,
      );
      return;
    }

    // —— 路径 A：战役 ScenarioTeamRuntime ——
    if (game.scenarioTeamRuntime) {
      const scenarioDef = game.scenarioTeamRuntime.getTeam(teamName);
      if (scenarioDef) {
        const scenarioOwner = this.resolveHousePlayer(game, scenarioDef.houseName);
        if (!scenarioOwner) {
          console.warn(
            `CreateReinforcement: no owner for house "${scenarioDef.houseName}" — cannot spawn "${teamName}".`,
          );
          return;
        }
        const scenarioUnits = game.scenarioTeamRuntime.spawnTaskForce(scenarioDef, scenarioOwner, waypointTile);
        if (scenarioUnits.length) {
          if (game.scenarioTeamRuntime.startInstance(scenarioDef, scenarioUnits, scenarioOwner)) {
            console.warn(
              `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${scenarioDef.houseName}, waypoint=${waypoint}, ` +
                `units=${scenarioUnits.length}) via scenarioTeamRuntime @ tick ${game.currentTick} — ${this.getDebugName()}`,
            );
            return;
          }
          // startInstance 失败 → 同 owner 的 AI 引擎兜底
          const bots = game.botManager && game.botManager.bots ? game.botManager.bots : undefined;
          for (const [player, bot] of bots ? bots : []) {
            const eng = bot && bot.aiApi ? bot.aiApi.engine : undefined;
            if (!eng || !eng.parsed) continue;
            if (player !== scenarioOwner && player.name !== scenarioOwner.name) continue;
            const scenarioTm = this.findTeamType(eng, teamName);
            if (!scenarioTm) continue;
            eng.spawnTeamWithUnits(scenarioTm, game.currentTick, scenarioUnits.map((u) => u.id));
            console.warn(
              `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${scenarioDef.houseName}, waypoint=${waypoint}, ` +
                `units=${scenarioUnits.length}) via AiEngine fallback @ tick ${game.currentTick} — ${this.getDebugName()}`,
            );
            return;
          }
        }
      }
    }

    // —— 路径 B：遍历 AI 引擎生成 ——
    const bots = game.botManager && game.botManager.bots ? game.botManager.bots : undefined;
    let firstEngine: any = undefined;
    let botCount = 0;
    let parsedCount = 0;
    for (const [player, bot] of bots ? bots : []) {
      botCount++;
      const eng = bot && bot.aiApi ? bot.aiApi.engine : undefined;
      if (!eng || !eng.parsed) continue;
      parsedCount++;
      if (!firstEngine) firstEngine = eng;
      const tm = this.findTeamType(eng, teamName);
      if (!tm) continue;
      // 归属阵营：TeamType.House= 优先，其次触发器 houseName
      const ownerName = (tm.house || this.trigger.houseName || "").toString().trim();
      const owner = this.resolveHousePlayer(game, ownerName);
      if (owner && owner !== player) continue;
      if (!owner && this.trigger.houseName && this.trigger.houseName.trim()) {
        const tp = this.resolveHousePlayer(game, this.trigger.houseName);
        if (tp && tp !== player) continue;
      }
      if (!owner) {
        console.warn(
          `CreateReinforcement: no owner for house "${this.trigger.houseName}" — cannot spawn "${teamName}".`,
        );
        return;
      }
      const tf = eng.parsed.taskForces[tm.taskForce];
      if (!tf || !tf.groups.length) {
        console.warn(`CreateReinforcement: team "${teamName}" has no TaskForce "${tm.taskForce}".`);
        return;
      }
      // 直接生成单位
      const units: any[] = [];
      let subCell = 0;
      const used = new Set();
      for (let gi = 0; gi < tf.groups.length; gi++) {
        const group = tf.groups[gi];
        for (let n = 0; n < group.count; n++) {
          const objType = this.findObjectType(game, group.unitType);
          const rulesObj = game.rules.getObject(group.unitType, objType);
          const unit = game.createUnitForPlayer(rulesObj, owner);
          if (unit.isInfantry()) unit.position.subCell = subCell++ % 5;
          units.push(unit);
        }
      }
      // 运输载具装载（可容纳乘客先入舱）
      const transports = units.filter((u) => !!u.transportTrait);
      const loaded = new Map();
      for (const u of units.filter((x) => !x.transportTrait)) {
        const t = transports.find((x) => x.transportTrait.unitFitsInside(u));
        if (t) {
          t.transportTrait.units.push(u);
          u.transport = t;
          loaded.set(u, t);
        }
      }
      // 生成：未装载单位找落点；已装载乘客在载具格生成后 limbo
      for (const u of units.filter((x) => !loaded.has(x))) {
        const st = this.findReinforcementSpawnTile(game, u, waypointTile, used);
        game.spawnObject(u, st);
        used.add(st);
      }
      for (const [u, t] of loaded) {
        game.spawnObject(u, t.tile);
        game.limboObject(u, { selected: false, inTransport: true });
      }
      eng.spawnTeamWithUnits(tm, game.currentTick, units.map((u) => u.id));
      console.warn(
        `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${ownerName || "?"}, waypoint=${waypoint}, ` +
          `units=${units.length}) via ${player.name} @ tick ${game.currentTick} — ${this.getDebugName()}`,
      );
      return;
    }

    // —— 路径 C：失败诊断 ——
    if (firstEngine) {
      console.warn(`TeamType "${teamName}" not found in any AI engine's map data.`);
      return;
    }
    console.warn(
      `No AI engine available for house "${this.trigger.houseName}" — cannot reinforce team "${teamName}" ` +
        `(bots=${botCount}, parsed engines=${parsedCount}).`,
    );
  }
}
