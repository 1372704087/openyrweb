/**
 * GarrisonBuildingTask — 驻军建筑任务。
 *
 * 继承 EnterBuildingTask（步兵走近并进入可驻军建筑）。InfantryAbsorb=yes
 * 建筑（生化反应堆）不再走本任务，而复用 EnterTransportTask；本任务只服务
 * 普通可驻军建筑（战斗碉堡/民房等）。
 *
 *  - isAllowed：目标未毁、可驻军、未满员、已驻军须同阵营、非中立民兵基地
 *    防御建筑、空建筑须友好/民用、单位未被心灵控制；
 *  - onEnter：恢复心灵控制 → limboObject → 民用建筑首占易主 →
 *    BuildingGarrisonEvent（首人进驻）→ units.push + garrisonedAt 回指
 *    （供 OccupyWeapon 系数生效）。返回 undefined → 父类结束任务。
 *
 * 由 game/gameobject/task/GarrisonBuildingTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import * as BuildingGarrisonEventModule from "game/event/BuildingGarrisonEvent"; // 未转换（any-shim）
import { EnterBuildingTask } from "game/gameobject/task/EnterBuildingTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GarrisonBuildingTask extends EnterBuildingTask {
  /** 驻军资格：可驻军 + 未满 + 阵营一致 + 非民兵基地防御 + 空建筑须友好/民用 + 非心灵控制。 */
  isAllowed(object: any): boolean {
    const target = this.target;
    if (target.isDestroyed || !target.garrisonTrait?.canBeOccupied()) return false;
    if (target.garrisonTrait.units.length >= target.garrisonTrait.maxOccupants) return false;
    if (target.garrisonTrait.units.length && target.garrisonTrait.units[0].owner !== object.owner) return false;
    if (target.rules.isBaseDefense && target.owner === this.game.getCivilianPlayer()) return false;
    if (
      !target.garrisonTrait.units.length &&
      !this.game.areFriendly(object, target) &&
      target.owner !== this.game.getCivilianPlayer()
    )
      return false;
    return !object.mindControllableTrait?.isActive();
  }

  /** 进建筑：limbo 入驻 + 民用首占 + 首人事件 + units 回填；返回 undefined → 父类结束任务。 */
  onEnter(object: any): void {
    if (object.mindControllableTrait?.isActive()) object.mindControllableTrait.restore(this.game);
    this.game.limboObject(object, {
      selected: false,
      controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(object).getControlGroupNumber(),
    });
    const garrisonTrait = this.target.garrisonTrait;
    if (
      !garrisonTrait.units.length &&
      this.target.owner === this.game.getCivilianPlayer() &&
      !this.target.rules.isBaseDefense
    ) {
      object.owner.buildingsCaptured++;
      this.game.changeObjectOwner(this.target, object.owner);
      this.target.wasCapturedFromCivilian = true;
    }
    if (!garrisonTrait.units.length) {
      this.game.events.dispatch(new BuildingGarrisonEventModule.BuildingGarrisonEvent(this.target));
    }
    garrisonTrait.units.push(object);
    // back-reference so the occupant's weapon can apply garrison bonuses
    // (OccupyWeaponRange / OccupyDamageMultiplier / OccupyROFMultiplier) while inside
    // (see Weapon.get range / get rof / fire). Cleared on evacuation/destruction.
    object.garrisonedAt = this.target;
  }
}
