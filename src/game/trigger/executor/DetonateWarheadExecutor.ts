/**
 * DetonateWarheadExecutor — 按武器内部 ID 在路径点引爆弹头。
 *
 * params[1]=武器内部 ID，params[6]=路径点。按 ID 查武器→查弹头→
 * 新建 Warhead 并在目标格引爆（含桥高/zone）。武器或弹头缺失、
 * 路径点无效均 warn 跳过；武器查找抛 RangeError 时捕获，其它异常
 * 继续上抛。
 *
 * 由 game/trigger/executor/DetonateWarheadExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { CollisionType } from "game/gameobject/unit/CollisionType"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DetonateWarheadExecutor extends TriggerExecutor {
  /** 按武器内部 ID 在路径点格引爆其弹头。 */
  execute(world: any): void {
    const weaponId = Number(this.action.params[1]);
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (tile) {
      let weapon: any;
      try {
        weapon = world.rules.getWeaponByInternalId(weaponId);
      } catch (err) {
        if (err instanceof RangeError)
          return void console.warn(
            `Weapon with internal ID "${weaponId}" not found. ` + `Skipping action ${this.getDebugName()}.`,
          );
        throw err;
      }
      let warheadRule: any;
      try {
        warheadRule = world.rules.getWarhead(weapon.warhead);
      } catch (err) {
        return void console.warn(
          `Warhead "${weapon.warhead}" not found. ` + `Skipping action ${this.getDebugName()}.`,
        );
      }
      const wh = new Warhead(warheadRule);
      const bridge = world.map.tileOccupation.getBridgeOnTile(tile);
      const elevation = bridge?.tileElevation ?? 0;
      const zone = world.map.getTileZone(tile);
      wh.detonate(
        world,
        weapon.damage,
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
