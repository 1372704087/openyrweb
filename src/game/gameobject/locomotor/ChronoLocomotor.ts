/**
 * ChronoLocomotor — 超时空移动器（瞬移到目标位置）。
 *
 * tick 返回瞬移距离（done=true 立即完成），并触发超时空冷却：
 * 距离 < chronoRangeMinimum → chronoMinimumDelay 帧，
 * 否则 → 距离 / chronoDistanceFactor 帧。
 *
 * 由 game/gameobject/locomotor/ChronoLocomotor.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ChronoLocomotor {
  game: any;
  /** 声明不带初始化器：赋值留在构造函数里，保持与孪生一致的属性建立顺序。 */
  ignoresTerrain: boolean;
  distanceToWaypoint: Vector2;

  constructor(game: any) {
    this.game = game;
    this.ignoresTerrain = true;
    this.distanceToWaypoint = new Vector2();
  }

  onNewWaypoint(_object: any, _targetPos: any): void {}

  /**
   * 每 tick：计算到目标的平面距离，触发超时空冷却，返回瞬移距离。
   * @param object 移动对象
   * @param targetPos 目标位置（地图 lepton）
   * @param _currentSpeed 当前速度（超时空不使用）
   * @param world 游戏世界（读取 general 规则）
   */
  tick(object: any, targetPos: any, _currentSpeed: any, world: any): { distance: Vector3; done: boolean; isTeleport?: boolean } {
    if (world) return { distance: new Vector3(), done: true };
    this.distanceToWaypoint.copy(targetPos).sub(object.position.getMapPosition());
    const general = this.game.rules.general;
    if (general.chronoTrigger) {
      const dist = this.distanceToWaypoint.length();
      const delay = dist < general.chronoRangeMinimum
        ? general.chronoMinimumDelay
        : dist / general.chronoDistanceFactor;
      object.warpedOutTrait.setTimed(delay, false, this.game);
    }
    return {
      distance: new Vector3(this.distanceToWaypoint.x, 0, this.distanceToWaypoint.y),
      done: true,
      isTeleport: true,
    };
  }
}
