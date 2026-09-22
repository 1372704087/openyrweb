/**
 * CaptureBuildingTask — 工程师占领建筑任务。
 *
 * 继承 EnterBuildingTask（走近并进入目标建筑），施加占领约束：
 *  - isAllowed：工程师 + 可占领 + 未摧毁 + 非 BuildDown + 非安全进度锁定 +
 *    非友好 + 非力场无敌；
 *  - onEnter：进场瞬间若仍处力场则中止（返回 undefined → 父类结束任务）；
 *    multiEngineer 且建筑血量高于阈值时不占领，改为用 c4Warhead 造成
 *    engineerDamage 等价伤害；delayedOils + 中立 + secureProgressTrait
 *    时走延迟占领进度，否则直接 changeObjectOwner + BuildingCaptureEvent。
 *
 * 由 game/gameobject/task/CaptureBuildingTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import * as BuildingCaptureEventModule from "game/event/BuildingCaptureEvent"; // 未转换（any-shim）
import { Warhead } from "game/Warhead"; // 已转换
import { CollisionType } from "game/gameobject/unit/CollisionType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { EnterBuildingTask } from "game/gameobject/task/EnterBuildingTask"; // 已转换
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CaptureBuildingTask extends EnterBuildingTask {
  /** 非 multiEngineer/instantCapture 且非中立/无需工程师建筑时，才有进门前占领延迟。 */
  static getCaptureDelaySeconds(game: any, target: any): number {
    return !(
      game.gameOpts.multiEngineer ||
      game.gameOpts.instantCapture ||
      target.owner.isNeutral ||
      target.rules.needsEngineer
    )
      ? game.rules.general.engineerCaptureDelay
      : 0;
  }

  constructor(game: any, target: any) {
    super(game, target, CaptureBuildingTask.getCaptureDelaySeconds(game, target));
  }

  /** 占领资格：工程师 + 可占领 + 未毁 + 非 BuildDown + 非安全锁定 + 非友好 + 非力场。 */
  isAllowed(object: any): boolean {
    return (
      object.rules.engineer &&
      this.target.rules.capturable &&
      !this.target.isDestroyed &&
      this.target.buildStatus !== BuildStatus.BuildDown &&
      !this.target.secureProgressTrait?.isActiveFrom(object.owner) &&
      !this.game.areFriendly(object, this.target) &&
      // 力场无敌中的建筑不可占领。
      !this.target.invulnerableTrait?.isForceShieldActive()
    );
  }

  /** 进建筑：处理 multiEngineer 伤害/延迟油井/正式易主；返回 undefined → 父类结束任务。 */
  onEnter(object: any): void {
    // 接近过程中若建筑仍处于力场，中止占领。
    if (this.target.invulnerableTrait?.isForceShieldActive()) return;
    if ((this.game.unspawnObject(object), this.game.gameOpts.multiEngineer)) {
      const general = this.game.rules.general;
      if (
        (!this.target.rules.needsEngineer || !general.engineerAlwaysCaptureTech) &&
        this.target.healthTrait.health > 100 * general.engineerCaptureLevel
      ) {
        let damage = Math.floor(general.engineerDamage * this.target.healthTrait.maxHitPoints);
        const leftover = Math.floor(
          (1 - Math.floor(1 / general.engineerDamage) * general.engineerDamage) *
            this.target.healthTrait.maxHitPoints,
        );
        damage = Math.min(damage, this.target.healthTrait.getHitPoints() - leftover);
        if (0 < damage) {
          const warheadId = this.game.rules.combatDamage.c4Warhead;
          const warhead = new Warhead(this.game.rules.getWarhead(warheadId));
          return void warhead.detonate(
            this.game,
            damage,
            this.target.tile,
            0,
            this.target.position.worldPosition,
            ZoneType.Ground,
            CollisionType.None,
            this.game.createTarget(this.target, this.target.tile),
            { player: object.owner, obj: object, weapon: void 0 },
            SpecialWarheadTypeModule.SpecialWarheadType.None,
            void 0,
            0,
          );
        }
      }
    }
    if (
      !(
        this.game.gameOpts.delayedOils &&
        this.target.owner.isNeutral &&
        this.target.secureProgressTrait?.start(this.target, object.owner)
      )
    ) {
      object.owner.buildingsCaptured++;
      this.game.changeObjectOwner(this.target, object.owner);
      this.game.events.dispatch(new BuildingCaptureEventModule.BuildingCaptureEvent(this.target));
    }
  }
}
