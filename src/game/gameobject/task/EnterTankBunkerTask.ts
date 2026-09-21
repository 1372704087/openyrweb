/**
 * EnterTankBunkerTask — 载具进入坦克碉堡。
 *
 * 流程：MoveTask 开到建筑中心（忽略建筑阻挡、严格贴近）→ 车体转 180°
 * → 等一帧视觉稳定 → 炮塔回正 → 直接写入 TankBunkerTrait.bunkeredVehicle
 * （绕过 DockTrait，避免每 tick 因不在 dock 格被弹出）并禁用移动、清空指令。
 *
 * 由 game/gameobject/task/EnterTankBunkerTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 已转换
import * as TurnTaskModule from "game/gameobject/task/TurnTask"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterTankBunkerTask extends Task {
  game: any;
  target: any;
  _turned: boolean;
  _settled: boolean;
  _turretTurning: boolean;

  constructor(game: any, target: any) {
    super();
    this.game = game;
    this.target = target;
    this.preventOpportunityFire = false;
  }

  onStart(object: any): void {
    // 入口格：地基右上角（载具可通行）。
    const foundation = this.target.getFoundation();
    const entryRx = this.target.tile.rx + foundation.width - 1;
    const entryRy = this.target.tile.ry;
    const entryTile = this.game.map.tiles.getByMapCoords(entryRx, entryRy);
    if (!entryTile) {
      this.cancel();
      return;
    }
    // targetOffset：入口格原点 → 建筑中心。
    const center = this.target.position.getMapPosition();
    const targetOffset = new Vector2(
      center.x - entryRx * Coords.LEPTONS_PER_TILE,
      center.y - entryRy * Coords.LEPTONS_PER_TILE,
    );
    this.children.push(
      new MoveTaskModule.MoveTask(this.game, entryTile, false, {
        ignoredBlockers: [this.target],
        targetOffset,
        closeEnoughTiles: Math.SQRT2 / 2,
        strictCloseEnough: true,
      }),
    );
  }

  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    if (!this.target.isSpawned || this.target.isDestroyed) return true;
    // 阶段 1：等待 MoveTask 完成。
    if (this.children.length > 0) return false;
    // 阶段 2：车体转向 180°。
    if (!this._turned) {
      this._turned = true;
      this.children.push(new TurnTaskModule.TurnTask(180));
      return false;
    }
    // 阶段 2a：等一帧视觉旋转稳定。
    if (!this._settled) {
      this._settled = true;
      return false;
    }
    // 阶段 3：炮塔回正。
    if (!this._turretTurning) {
      this._turretTurning = true;
      if (object.turretTrait) {
        object.turretTrait.desiredFacing = 180;
      }
      return false;
    }
    if (object.turretTrait && object.turretTrait.isRotating()) return false;
    // 阶段 4：直接写入 TankBunkerTrait（绕过 DockTrait）。
    const tbTrait = this.target.tankBunkerTrait;
    if (tbTrait) {
      tbTrait.bunkeredVehicle = object;
      tbTrait._prevDockedCount = 1;
      object.bunkeredAt = this.target;
      if (object.moveTrait) {
        object.moveTrait.setDisabled(true);
      }
      if (object.unitOrderTrait) {
        object.unitOrderTrait.clearOrders();
        object.unitOrderTrait.cancelAllTasks();
      }
    }
    return true;
  }

  isValidTarget(object: any, target: any): boolean {
    return object.isSpawned && this.game.areFriendly(object, target);
  }
}
