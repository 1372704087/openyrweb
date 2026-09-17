/**
 * FootLocomotor — 步兵移动器（地面行走 + 姿态加速 + 地形速度）。
 *
 * 每 tick 计算到航点的平面距离，按地形通行速度、姿态（卧倒减速/恐慌
 * 加速）合成实际移动距离，设置 velocity 并返回是否到达。
 *
 * 由 game/gameobject/locomotor/FootLocomotor.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FootLocomotor {
  game: any;
  currentMoveDirection: Vector2;
  distanceToWaypoint: Vector2;
  endPauseFrames: number;

  constructor(game: any) {
    this.game = game;
    this.currentMoveDirection = new Vector2();
    this.distanceToWaypoint = new Vector2();
    this.endPauseFrames = 0;
  }

  /** 新航点：更新朝向（立即转向目标方向）。 */
  onNewWaypoint(object: any, targetPos: any): void {
    this.currentMoveDirection.copy(targetPos).sub(object.position.getMapPosition());
    const facing = FacingUtilModule.FacingUtil.fromMapCoords(this.currentMoveDirection);
    if (facing !== object.direction) object.direction = facing;
    this.endPauseFrames = 1;
  }

  onWaypointUpdate(object: any, targetPos: any): void {
    this.onNewWaypoint(object, targetPos);
  }

  /**
   * 每 tick：计算移动距离。
   * 速度 = baseSpeed（取整） × 姿态修正（卧倒×0.5/×2，恐慌×2）
   *        × 地形通行速度（取整）。
   * @param object 移动对象
   * @param targetPos 目标位置（地图 lepton）
   * @param lastTile 上一个 tile（判断是否到达）
   */
  tick(object: any, targetPos: any, lastTile: any): { distance: Vector3; done: boolean } {
    let speed = Math.floor(object.moveTrait.baseSpeed);
    // 姿态修正：卧倒减速（crawls=yes ×0.5）或加倍，恐慌 ×2。
    if (object.stance === StanceType.Prone) speed *= object.art.crawls ? 0.5 : 2;
    if (object.isPanicked) speed *= 2;
    // 地形通行速度（0 表示不可通行，回落上一个 tile 的速度）。
    let terrainSpeed = this.game.map.terrain.getPassableSpeed(
      object.tile,
      object.rules.speedType,
      object.isInfantry(),
      object.onBridge,
      undefined,
      true,
    );
    if (terrainSpeed) {
      object.moveTrait.lastTileSpeed = terrainSpeed;
    } else {
      terrainSpeed = object.moveTrait.lastTileSpeed || 1;
    }
    speed *= terrainSpeed;
    speed = Math.floor(speed);
    // 计算到航点的剩余距离。
    this.distanceToWaypoint.copy(targetPos).sub(object.position.getMapPosition());
    const step = this.distanceToWaypoint.clone().setLength(speed);
    if (step.length() || targetPos.equals(lastTile)) {
      object.moveTrait.velocity.set(step.x, 0, step.y);
    }
    const travel = Math.min(this.distanceToWaypoint.length(), speed);
    const paused = !travel && this.endPauseFrames-- > 0;
    this.distanceToWaypoint.setLength(travel);
    return {
      distance: new Vector3(this.distanceToWaypoint.x, 0, this.distanceToWaypoint.y),
      done: !this.distanceToWaypoint.length() && !paused,
    };
  }
}
