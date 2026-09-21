/**
 * EnterBuildingTask — 进入建筑任务（步兵进医院/碉堡/民用建筑等）。
 *
 * 状态机：
 *  - Initial →（有进出门延迟或 Grinder）MovingNear：先 MoveNextTo 走到门口；
 *  - Initial →（无延迟）MovingIn：直接 MoveInside 进入；
 *  - MovingNear：到位后延迟建筑走 castProgressTrait 施法条，否则进 MovingIn；
 *  - WaitingForDelay：等施法完成再 MoveInside；
 *  - MovingIn：子任务移动中跟踪 lastOutsideTile；isAllowed 失败则 MovingOut；
 *  - 进入瞬间 dispatch EnterObjectEvent，调用 onEnter（子类覆盖）；
 *    onEnter 返回 false → 拒绝进入并 MoveOutside；
 *  - MovingOut / 取消 / 移动禁用 → 任务结束。
 *
 * Grinder（Grinding=yes）：先走到四边中点最近的门格，再进入（无施法条）。
 *
 * 由 game/gameobject/task/EnterBuildingTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as MoveOutsideTaskModule from "game/gameobject/task/move/MoveOutsideTask"; // 已转换
import * as MoveInsideTaskModule from "game/gameobject/task/move/MoveInsideTask"; // 已转换
import * as EnterObjectEventModule from "game/event/EnterObjectEvent"; // 未转换（any-shim）
import * as MoveNextToTaskModule from "game/gameobject/task/move/MoveNextToTask"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）

/** 进入建筑状态。 */
export const EnterBuildingState = {
  Initial: 0,
  MovingNear: 1,
  WaitingForDelay: 2,
  MovingIn: 3,
  MovingOut: 4,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterBuildingTask extends Task {
  game: any;
  target: any;
  enterDelaySeconds: number;
  state: number;
  rangeHelper: any;
  lastOutsideTile: any;

  constructor(game: any, target: any, enterDelaySeconds = 0) {
    super();
    this.game = game;
    this.target = target;
    this.enterDelaySeconds = enterDelaySeconds;
    this.state = EnterBuildingState.Initial;
    this.preventOpportunityFire = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(this.game.map.tileOccupation);
  }

  // isAllowed / onEnter 由子类实现（与孪生一致，基类原型上不存在）。

  onTick(object: any): boolean {
    if ((this.isCancelling() && this.state === EnterBuildingState.Initial) || object.moveTrait.isDisabled()) {
      return true;
    }
    if (this.state === EnterBuildingState.MovingOut) return true;
    if (this.state === EnterBuildingState.MovingIn && this.children.length) {
      if (object.tile !== this.lastOutsideTile) {
        if (!this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target)) {
          this.lastOutsideTile = object.tile;
        }
      }
      return false;
    }
    // Grinder（Grinding=yes）或有进出门延迟：先走到门口再进入。
    const useDoorApproach =
      this.state !== EnterBuildingState.MovingIn &&
      (this.enterDelaySeconds > 0 || !!this.target.rules?.grinding);
    let atEntry = this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target);
    atEntry = useDoorApproach
      ? !atEntry && this.rangeHelper.isInTileRange(object.tile, this.target, 0, Math.SQRT2)
      : atEntry;

    if (this.state === EnterBuildingState.Initial) {
      if (useDoorApproach) {
        this.state = EnterBuildingState.MovingNear;
        if (!atEntry) {
          this.children.push(
            new MoveNextToTaskModule.MoveNextToTask(
              this.game,
              this.target,
              this.target.rules?.grinding ? this.findGrinderDoor(object) : undefined,
            ),
          );
          return false;
        }
      } else {
        this.state = EnterBuildingState.MovingIn;
        if (!atEntry) {
          this.children.push(new MoveInsideTaskModule.MoveInsideTask(this.game, this.target).setBlocking(false));
          this.preventOpportunityFire = true;
          return false;
        }
      }
    }
    if (!atEntry) return true;
    if (!(this as any).isAllowed(object) || this.isCancelling()) {
      if (this.state !== EnterBuildingState.MovingIn) return true;
      this.children.push(
        new MoveOutsideTaskModule.MoveOutsideTask(this.game, this.target, this.lastOutsideTile),
      );
      this.state = EnterBuildingState.MovingOut;
      return false;
    }
    if (this.state === EnterBuildingState.MovingNear) {
      this.lastOutsideTile = object.tile;
      if (this.enterDelaySeconds > 0) {
        const cast = object.castProgressTrait;
        if (!cast) throw new Error("Enter delay requires a unit with a cast progress trait");
        cast.reset();
        cast.start(this.enterDelaySeconds);
        this.state = EnterBuildingState.WaitingForDelay;
      } else {
        // Grinder：门口已到 — 直接走入（无施法条）。
        this.state = EnterBuildingState.MovingIn;
        this.children.push(new MoveInsideTaskModule.MoveInsideTask(this.game, this.target).setBlocking(false));
        this.preventOpportunityFire = true;
        return false;
      }
    }
    if (this.state !== EnterBuildingState.WaitingForDelay) {
      this.game.events.dispatch(new EnterObjectEventModule.EnterObjectEvent(this.target, object));
      // 孪生：false !== onEnter → 成功（含 undefined/true）时 onTick 返回 true 结束任务；
      // 仅显式 false 表示拒绝进入并退出建筑。
      if ((this as any).onEnter(object) !== false) return true;
      this.children.push(
        new MoveOutsideTaskModule.MoveOutsideTask(this.game, this.target, this.lastOutsideTile),
      );
      this.state = EnterBuildingState.MovingOut;
      return false;
    }
    const cast = object.castProgressTrait;
    if (!cast.isCasting() && !cast.isCompleted()) cast.start(this.enterDelaySeconds);
    if (!cast.isCompleted()) return false;
    cast.reset();
    this.state = EnterBuildingState.MovingIn;
    this.children.push(new MoveInsideTaskModule.MoveInsideTask(this.game, this.target).setBlocking(false));
    this.preventOpportunityFire = true;
    return false;
  }

  onEnd(object: any): void {
    object.castProgressTrait?.reset();
  }

  /**
   * Grinder：取建筑四边中点（十字门位）中离单位最近的合法格，
   * 使单位走到门口而不是从任意方向进入。
   */
  findGrinderDoor(object: any): any {
    const building = this.target;
    const fw = building.art.foundation.width;
    const fh = building.art.foundation.height;
    const bx = building.tile.rx;
    const by = building.tile.ry;
    const midX = bx + Math.floor(fw / 2);
    const midY = by + Math.floor(fh / 2);
    const candidates = [
      [midX, by - 1],
      [midX, by + fh],
      [bx - 1, midY],
      [bx + fw, midY],
    ];
    let best: any;
    let bestD = Infinity;
    for (const [x, y] of candidates) {
      const tile = this.game.map.tiles.getByMapCoords(x, y);
      if (!tile || !this.game.map.mapBounds.isWithinBounds(tile)) continue;
      const dx = tile.rx - object.tile.rx;
      const dy = tile.ry - object.tile.ry;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = tile;
      }
    }
    return best;
  }

  getTargetLinesConfig(_world: any): any {
    return { target: this.target, pathNodes: [] };
  }
}
