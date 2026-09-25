/**
 * SpawnLinkTrait — 出生体连接（子机跟随母体攻击目标/移动，超出范围强制拉回）。
 *
 * 由 game/gameobject/trait/SpawnLinkTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as AttackTaskModule from "game/gameobject/task/AttackTask"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as AttackTraitModule from "game/gameobject/trait/AttackTrait"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SpawnLinkTrait {
  parent: any;

  setParent(parent: any) {
    this.parent = parent;
  }
  getParent() {
    return this.parent;
  }
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any) {
    if (!this.parent || !obj.attackTrait || !obj.primaryWeapon) return;
    const parentTarget = this.parent.attackTrait?.currentTarget;
    const currentTask = obj.unitOrderTrait.getCurrentTask();
    const rangeHelper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    const spawnerWeapon = this.parent.armedTrait?.getWeapons().find((weapon: any) => weapon.rules.spawner);
    const parentMoving =
      !parentTarget &&
      this.parent.isUnit() &&
      (this.parent.unitOrderTrait.getCurrentTask() instanceof MoveTaskModule.MoveTask ||
        this.parent.unitOrderTrait.getCurrentTask() instanceof AttackTaskModule.AttackTask);
    const targetsInSync =
      parentTarget && obj.attackTrait.currentTarget
        ? parentTarget.equals(obj.attackTrait.currentTarget)
        : parentTarget === obj.attackTrait.currentTarget || parentMoving;
    const inWeaponRange =
      !parentTarget ||
      (spawnerWeapon &&
        rangeHelper.isInWeaponRange(this.parent, parentTarget.obj ?? parentTarget.tile, spawnerWeapon, world.rules));
    // 孪生 `ammo && !targetsInSync && inRange ? 攻击路径 : 跟随父`：未同步才跟随母体目标
    if (obj.ammo && !targetsInSync && inWeaponRange) {
      if (parentTarget && obj.primaryWeapon.targeting.canTarget(parentTarget.obj, parentTarget.tile, world, true, false)) {
        if (!currentTask || currentTask instanceof MoveTaskModule.MoveTask) {
          obj.unitOrderTrait.cancelAllTasks();
          obj.unitOrderTrait.addTask(
            obj.attackTrait.createAttackTask(world, parentTarget.obj, parentTarget.tile, obj.primaryWeapon, {
              force: true,
            }),
          );
        } else if (obj.attackTrait.attackState !== AttackTraitModule.AttackState.Idle) {
          currentTask.requestTargetUpdate(parentTarget);
        }
      } else if (currentTask) {
        if (!(currentTask instanceof MoveTaskModule.MoveTask)) currentTask.cancel();
      } else {
        this.tryMoveToParent(obj, this.parent, world);
      }
    } else {
      this.tryMoveToParent(obj, this.parent, world);
    }
  }
  tryMoveToParent(obj: any, parent: any, world: any) {
    if (obj.tile === parent.tile) return;
    const currentTask = obj.unitOrderTrait.getCurrentTask();
    if (currentTask) {
      if (currentTask instanceof MoveTaskModule.MoveTask) {
        currentTask.updateTarget(parent.tile, !!parent.isUnit() && parent.onBridge);
      }
    } else {
      obj.unitOrderTrait.addTask(
        new MoveTaskModule.MoveTask(world, parent.tile, !!parent.isUnit() && parent.onBridge, {
          closeEnoughTiles: 0,
          strictCloseEnough: true,
        }),
      );
    }
  }
}
