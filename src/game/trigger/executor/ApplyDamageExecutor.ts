/**
 * ApplyDamageExecutor — 在路径点施加固定伤害（HE 引爆）。
 *
 * 第三参 damage（工厂传入 100）。execute 取 params[1] 路径点，
 * 用 HE 弹头在该格引爆 damage 伤害（含桥上高度与 zone 修正）；
 * 无有效路径点则 warn 跳过。
 *
 * 由 game/trigger/executor/ApplyDamageExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { CollisionType } from "game/gameobject/unit/CollisionType"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApplyDamageExecutor extends TriggerExecutor {
  /** 引爆伤害值（工厂通常传 100）。 */
  damage: number;

  constructor(action: any, trigger: any, damage: number) {
    super(action, trigger);
    this.damage = damage;
  }

  /** 在路径点以 HE 弹头引爆 damage 伤害。 */
  execute(world: any): void {
    const waypoint = Number(this.action.params[1]);
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (tile) {
      const warheadRule = world.rules.getWarhead(Warhead.HE_WARHEAD_NAME);
      const wh = new Warhead(warheadRule);
      const bridge = world.map.tileOccupation.getBridgeOnTile(tile);
      const elevation = bridge?.tileElevation ?? 0;
      const zone = world.map.getTileZone(tile);
      wh.detonate(
        world,
        this.damage,
        tile,
        elevation,
        Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z + elevation),
        zone,
        bridge ? CollisionType.OnBridge : CollisionType.None,
        world.createTarget(bridge, tile),
        undefined,
        undefined,
        undefined,
        undefined,
      );
    } else
      console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping action ${this.getDebugName()}.`);
  }
}
