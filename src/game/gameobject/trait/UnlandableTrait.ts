/**
 * UnlandableTrait — 不可降落飞行器（Idle 时飞向地图边缘并 unspawn）。
 *
 * 出生在地图边缘的飞行器（如伞兵运输机）Idle 时沿 bresenham 直线飞向
 * 地图边缘，到达后将自身 unspawn（从地图上消失）。
 * 由 game/gameobject/trait/UnlandableTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as bresenhamModule from "util/bresenham"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 未转换（any-shim）
import * as TaskGroupModule from "game/gameobject/task/system/TaskGroup"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnlandableTrait {
  enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (
      this.enabled &&
      (object.owner.isNeutral || object.name === world.rules.general.paradrop.paradropPlane) &&
      object.unitOrderTrait.isIdle()
    ) {
      const exitTile = this.chooseExitTile(object.tile, world);
      object.unitOrderTrait.addTask(
        new TaskGroupModule.TaskGroup(
          new MoveTaskModule.MoveTask(world, exitTile, false, { allowOutOfBoundsTarget: true }),
          new CallbackTaskModule.CallbackTask((obj: any) => world.unspawnObject(obj)),
        ).setCancellable(false),
      );
    }
  }

  /** 从当前格沿 bresenham 直线飞向地图边缘，返回最后一个可达格。 */
  chooseExitTile(fromTile: any, world: any): any {
    const mapSize = world.map.tiles.getMapSize();
    const edgePoint =
      world.generateRandom() > 0.5
        ? new Vector2(Math.floor(mapSize.width / 2), 0)
        : new Vector2(0, Math.floor(mapSize.height / 2));
    const from = new Vector2(fromTile.rx, fromTile.ry);
    const path = bresenhamModule.bresenham(from.x, from.y, edgePoint.x, edgePoint.y)
      .map((coords: any) => world.map.tiles.getByMapCoords(coords.x, coords.y))
      .filter(isNotNullOrUndefined);
    if (!path.length) throw new Error("No valid exit tile found");
    return path[path.length - 1];
  }
}
