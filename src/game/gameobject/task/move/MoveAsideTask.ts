/**
 * MoveAsideTask — 让路任务（被挡路的单位请旁边的同阵营单位挪一格）。
 *
 * MoveTask 碰撞处理在"请求让路"时给挡路者挂的本任务：
 *  1. 找空位：绕当前格按 45° 步进转一圈检查 8 个相邻格（跳过 0°
 *     ——自己站着的位置——除非已经链式推过人；跳过 180°——不许往
 *     推我的人的方向挪），要求格子在图内且无障碍/位置合法
 *     （飞行单位跳过这两项检查）；找到就挪过去（步兵部署状态先
 *     解除部署），任务结束；
 *  2. 找不到空位 → 链式推挤：把推我来方向那一格上的同阵营挡路
 *     单位（不在等待/没有任务在身的）也各挂一个 MoveAsideTask
 *     （同方向），自己等 1 tick；若那格上的单位都在忙 → 等 5 tick
 *     再看；两次都没戏（chainPushIssued 后仍无空位）→ 等 5 tick
 *     循环直到 40 tick 超时放弃。
 *
 * 结束/取消时负责把单位的碰撞状态恢复为 Resolved（onEnd）。
 *
 * 由 game/gameobject/task/move/MoveAsideTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask"; // 已转换
import { MoveState, CollisionState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换

/** 让路等待/超时步长：链式等待 5 tick，总超时 40 tick。 */
const WAIT_CHAIN_TICKS = 5;
const TIMEOUT_TICKS = 40;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveAsideTask extends Task {
  game: any;
  /** 推挤来向（单位向量）：空位搜索时 180° 方向被禁止。 */
  fromDirection: any;
  /** 已找到空位并派出移动子任务。 */
  resolved: boolean;
  /** 是否已发起过链式推挤（只允许一轮）。 */
  chainPushIssued: boolean;
  /** 已等待的 tick 数（超时放弃）。 */
  timeoutTicks: number;

  constructor(game: any, fromDirection: any) {
    super();
    this.game = game;
    this.fromDirection = fromDirection;
    this.resolved = false;
    this.chainPushIssued = false;
  }

  /** 收尾：解除碰撞等待状态。 */
  onEnd(object: any): void {
    object.moveTrait.collisionState = CollisionState.Resolved;
  }

  /**
   * 每 tick：先找空位挪走；找不到就链式推挤或等待；
   * 返回 true 表示任务结束（已解决/超时/取消/单位瘫痪）。
   */
  onTick(object: any): boolean {
    this.timeoutTicks = undefined === this.timeoutTicks ? 0 : this.timeoutTicks + 1;
    if (TIMEOUT_TICKS < this.timeoutTicks || this.resolved || this.isCancelling()) return true;
    const map = this.game.map;
    const movePositionHelper = new MovePositionHelperModule.MovePositionHelper(map);
    const currentBridge = object.onBridge ? map.tileOccupation.getBridgeOnTile(object.tile) : undefined;
    // 8 邻格按 45° 步进找空位：0°（原地）只在链式推过后才允许，
    // 180°（朝推挤来向）永远禁止。
    let freeTile: any;
    let freeTileBridge: any;
    for (let angle = 0; angle < 360; angle += 45) {
      if ((0 !== angle || this.chainPushIssued) && 180 !== angle) {
        const rotated = geometryModule.rotateVec2(this.fromDirection.clone(), angle).round();
        const neighbor = map.tiles.getByMapCoords(object.tile.rx + Math.sign(rotated.x), object.tile.ry + Math.sign(rotated.y));
        if (neighbor && map.mapBounds.isWithinBounds(neighbor)) {
          freeTileBridge = map.tileOccupation.getBridgeOnTile(neighbor);
          if (
            object.rules.movementZone === MovementZone.Fly ||
            (!map.terrain.findObstacles({ tile: neighbor, onBridge: freeTileBridge }, object).length &&
              movePositionHelper.isEligibleTile(neighbor, freeTileBridge, currentBridge, object.tile))
          ) {
            freeTile = neighbor;
            break;
          }
        }
      }
    }
    if (freeTile) {
      // 找到空位：解除部署（部署状态的步兵先站起来）再挪过去。
      this.resolved = true;
      if (object.isInfantry() && object.deployerTrait && object.deployerTrait.isDeployed()) {
        object.deployerTrait.setDeployed(false);
      }
      if (object.moveTrait.isDisabled()) return true;
      this.children.push(
        new MoveTask(this.game, freeTile, !!freeTileBridge, { closeEnoughTiles: 0, strictCloseEnough: true }),
      );
      return false;
    }
    {
      // 没有空位：已链式推过 → 等 5 tick 再循环（等前面的人挪开）。
      if (this.chainPushIssued) {
        this.children.push(new WaitTicksTask(WAIT_CHAIN_TICKS));
        return false;
      }
      // 链式推挤：查看推挤来向的那一格。
      const pusherTile = map.tiles.getByMapCoords(
        object.tile.rx + Math.sign(this.fromDirection.x),
        object.tile.ry + Math.sign(this.fromDirection.y),
      );
      if (!pusherTile || !map.mapBounds.isWithinBounds(pusherTile)) return true;
      const pusherBridge = map.tileOccupation.getBridgeOnTile(pusherTile);
      // 那一格上的同阵营可推单位（空降中伞兵/带导弹挂架的飞机除外）。
      const pushables = map.tileOccupation
        .getGroundObjectsOnTile(pusherTile)
        .filter(
          (obj: any) =>
            obj.isUnit() &&
            obj.owner === object.owner &&
            obj.tile === pusherTile &&
            obj.onBridge === !!pusherBridge &&
            !(obj.isInfantry() && obj.stance === StanceType.Paradrop) &&
            !(obj.isAircraft() && obj.missileSpawnTrait),
        );
      if (
        pushables.find(
          (obj: any) => obj.moveTrait.collisionState === CollisionState.Waiting || obj.unitOrderTrait.hasTasks(),
        )
      ) {
        // 都在忙：等 5 tick 再看。
        this.children.push(new WaitTicksTask(WAIT_CHAIN_TICKS));
        object.moveTrait.collisionState = CollisionState.Waiting;
        object.moveTrait.moveState = MoveState.PlanMove;
        return false;
      }
      // 全部闲着：给它们各挂一个同方向 MoveAsideTask（链式传递），自己等 1 tick。
      pushables.forEach((obj: any) => {
        obj.unitOrderTrait.addTask(new MoveAsideTask(this.game, this.fromDirection));
      });
      this.children.push(new WaitTicksTask(1));
      object.moveTrait.collisionState = CollisionState.Waiting;
      object.moveTrait.moveState = MoveState.PlanMove;
      this.chainPushIssued = true;
      return false;
    }
  }
}
