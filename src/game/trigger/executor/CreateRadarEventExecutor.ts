/**
 * CreateRadarEventExecutor — 向全部战斗方广播雷达事件。
 *
 * type = params[1]-1（1 基转 0 基）；须在 RadarEventType 枚举值域内。
 * 路径点取 params[6]；有效时对每个战斗方经 RadarTrait.addEventForPlayer
 * 派发。无效路径点或未知类型均 warn 跳过。
 *
 * 由 game/trigger/executor/CreateRadarEventExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { RadarEventType } from "game/rules/general/RadarRules"; // 已转换
import { RadarTrait } from "game/trait/RadarTrait"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CreateRadarEventExecutor extends TriggerExecutor {
  /** 校验类型并把路径点雷达事件广播给全部战斗方。 */
  execute(world: any): void {
    const radarType = Number(this.action.params[1]) - 1;
    if (Object.values(RadarEventType).includes(radarType)) {
      const waypoint = this.action.params[6];
      const tile = world.map.getTileAtWaypoint(waypoint);
      if (tile)
        for (const s of world.getCombatants())
          world.traits.get(RadarTrait).addEventForPlayer(radarType, s, tile, world);
      else
        console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping action ${this.getDebugName()}.`);
    } else console.warn(`Unknown radar event type "${1 + radarType}". Skipping action ${this.getDebugName()}.`);
  }
}
