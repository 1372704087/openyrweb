/**
 * AttackOrder — 攻击指令（右键点敌/强攻/鲍里斯空袭/C4）。
 *
 * 构造可选 { forceAttack, noIvanBomb }：ForceAttack=强攻（可打友军/建筑），
 * Attack=默认攻击（禁 Ivan 炸弹），PlaceBomb=允许 Ivan 炸弹。
 *  - isValid：C4 建筑分支 → SpecialAttack；鲍里斯空袭（secondaryWeapon
 *    带 MigAttackCursor 且目标为建筑）→ 校验冷却/友军/桥头堡后返回；
 *    否则按选武 + 射程/LOS/弹头规则判定；
 *  - process：C4 → PlantC4Task；空袭 → AirstrikeAttackTask；
 *    其余 → AttackTask（部署中的单位先解除部署）；
 *  - onAdd：飞行单位取消可插队的移动/攻击任务；地面载具给移动挂
 *    速度惩罚；时空武器攻击中则改写现有 AttackTask 目标。
 *
 * 由 game/order/AttackOrder.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标。
 */
import { Order } from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { AttackTask } from "game/gameobject/task/AttackTask"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import * as LosHelperModule from "game/gameobject/unit/LosHelper"; // 未转换（any-shim）
import { ArmorType } from "game/type/ArmorType"; // 已转换
import { PlantC4Task } from "game/gameobject/task/PlantC4Task"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import { AirstrikeAttackTask } from "game/gameobject/task/AirstrikeAttackTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackOrder extends Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  isC4: boolean;
  forceAttack: boolean;
  ivanBombAllowed: boolean;
  rangeHelper: any;
  losHelper: any;

  constructor(game: any, { forceAttack, noIvanBomb }: any = {}) {
    super(forceAttack ? OrderType.ForceAttack : OrderType.Attack);
    this.game = game;
    this.isC4 = false;
    this.forceAttack = !!forceAttack;
    this.ivanBombAllowed = !noIvanBomb || !!forceAttack;
    this.targetOptional = false;
    this.feedbackType = OrderFeedbackType.None;
    this.rangeHelper = new RangeHelperModule.RangeHelper(this.game.map.tileOccupation);
    this.losHelper = new LosHelperModule.LosHelper(this.game.map.tiles, game.map.tileOccupation);
  }

  /**
   * 光标：禁攻击→NoAction；C4→C4；空袭→AirStrike；sabotage→C4；
   * Ivan/排弹/治疗弹各有专用指针；否则按全员是否在射程内选
   * AttackRange / AttackNoRange / AttackMini。
   */
  getPointerType(isMini: any, units: any): any {
    if (!this.isAllowed()) return isMini ? PointerTypeModule.PointerType.NoActionMini : PointerTypeModule.PointerType.NoAction;
    if (this.isC4) return PointerTypeModule.PointerType.C4;
    // Boris airstrike cursor — when the selected weapon has MigAttackCursor=yes
    // and the target is a building (valid airstrike target), show the AirStrike pointer.
    let weapon = this.selectAirstrikeWeapon(this.sourceObject, this.target);
    if (!weapon)
      weapon = this.sourceObject.attackTrait?.selectWeaponVersus(
        this.sourceObject,
        this.target,
        this.game,
        this.forceAttack,
      );
    if (weapon?.rules.migAttackCursor && this.target.obj?.isBuilding()) return PointerTypeModule.PointerType.AirStrike;
    if (weapon?.rules.sabotageCursor) return PointerTypeModule.PointerType.C4;
    if (this.ivanBombAllowed && this.sourceObject.rules.ivan && weapon?.warhead.rules.ivanBomb)
      return PointerTypeModule.PointerType.Dynamite;
    if (weapon?.warhead.rules.bombDisarm) return PointerTypeModule.PointerType.DefuseBomb;
    if (weapon && weapon.rules.damage < 0) return PointerTypeModule.PointerType.RepairMove;
    const allInRange = units.every((unit: any) => {
      if (!unit.attackTrait) return true;
      const unitWeapon = unit.attackTrait.selectWeaponVersus(unit, this.target, this.game, this.forceAttack);
      return (
        !unitWeapon ||
        (this.rangeHelper.isInWeaponRange(unit, this.target.obj || this.target.tile, unitWeapon, this.game.rules) &&
          this.losHelper.hasLineOfSight(unit, this.target.obj || this.target.tile, unitWeapon))
      );
    });
    return isMini
      ? PointerTypeModule.PointerType.AttackMini
      : allInRange
        ? PointerTypeModule.PointerType.AttackRange
        : PointerTypeModule.PointerType.AttackNoRange;
  }

  /** 目标有效性：C4/空袭/常规武器三路分支（详见类注释）。 */
  isValid(): boolean {
    if (!this.sourceObject.attackTrait) return false;
    if (
      this.forceAttack &&
      this.game.mapShroudTrait
        .getPlayerShroud(this.sourceObject.owner)
        ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
      !this.sourceObject.isBuilding()
    )
      return false;
    const targetObj = this.target.obj;
    let terrain = this.game.map.getGroundObjectsOnTile(this.target.tile).find((obj: any) => obj.isTerrain());
    if (
      ((this.terminal = !targetObj && !terrain),
      this.sourceObject.c4 &&
        targetObj?.isBuilding() &&
        targetObj.c4ChargeTrait &&
        (this.forceAttack || !this.game.areFriendly(targetObj, this.sourceObject) || targetObj.cabHutTrait))
    )
      return ((this.isC4 = true), (this.feedbackType = OrderFeedbackType.SpecialAttack), true);
    if (((this.isC4 = false), (this.feedbackType = OrderFeedbackType.Attack), !this.game.isValidTarget(targetObj)))
      return false;
    if (!targetObj && terrain?.rules.immune) return false;
    if (
      !(
        targetObj ||
        this.target.tile !== this.sourceObject.tile ||
        (this.sourceObject.isUnit() && this.sourceObject.zone === ZoneType.Air)
      )
    )
      return false;
    if (targetObj === this.sourceObject) return false;
    // Boris airstrike — check if the unit has AirstrikeTrait and the target
    // is a building. If so, check if the airstrike is ready (cooldown, etc.).
    const airstrikeWeapon = this.selectAirstrikeWeapon(this.sourceObject, this.target);
    if (airstrikeWeapon && targetObj?.isBuilding() && this.sourceObject.airstrikeTrait) {
      // the airstrike is for enemy buildings — friendly buildings can
      // only be targeted with a force-attack (Ctrl), while bridge repair huts
      // (cab huts) are never targetable, matching the normal weapon behaviour.
      if (targetObj.cabHutTrait || (!this.forceAttack && this.game.areFriendly(targetObj, this.sourceObject)))
        return false;
      if (!this.sourceObject.airstrikeTrait.isReady(this.sourceObject)) return false;
      // No voice at order time — the airstrike voice plays when the MiGs
      // spawn (see AirstrikeTrait.spawnMiGs), matching vanilla YR.
      this.feedbackType = OrderFeedbackType.None;
      return true;
    }
    let weapon = this.sourceObject.attackTrait.selectWeaponVersus(
      this.sourceObject,
      this.target,
      this.game,
      this.forceAttack,
    );
    // if the selected weapon is the secondary weapon and the unit
    // has VoiceSecondaryWeaponAttack configured, use the dedicated feedback
    // type so the sound handler plays the correct voice line.
    weapon &&
      weapon === this.sourceObject.secondaryWeapon &&
      this.sourceObject.rules.voiceSecondaryWeaponAttack &&
      (this.feedbackType = OrderFeedbackType.SecondaryWeaponAttack);
    return (
      !!weapon &&
      !(!this.ivanBombAllowed && weapon.warhead.rules.ivanBomb) &&
      !(
        targetObj?.isBuilding() &&
        targetObj.cabHutTrait &&
        !weapon.warhead.rules.ivanBomb &&
        !weapon.warhead.rules.bombDisarm
      ) &&
      !!(
        (this.sourceObject.isUnit() &&
          this.sourceObject.moveTrait &&
          !this.sourceObject.moveTrait.isDisabled()) ||
        this.rangeHelper.isInWeaponRange(this.sourceObject, targetObj || this.target.tile, weapon, this.game.rules)
      ) &&
      !(
        this.sourceObject.airSpawnTrait &&
        weapon.rules.spawner &&
        !this.game.map.isWithinBounds(this.target.tile)
      ) &&
      (!!this.forceAttack ||
        ((!targetObj?.isBuilding() || !targetObj.hospitalTrait) &&
          !(!targetObj || !targetObj.healthTrait) &&
          !targetObj.isDestroyed &&
          !targetObj.isCrashing &&
          (!(
            !targetObj.isOverlay() ||
            !(weapon.warhead.rules.wall || (weapon.warhead.rules.wood && targetObj.rules.armor === ArmorType.Wood))
          ) ||
            targetObj.isTechno())))
    );
  }

  /** attackTrait 未瘫痪即可攻击。 */
  isAllowed(): boolean {
    return !this.sourceObject.attackTrait.isDisabled();
  }

  /** 生成攻击任务：C4 / 鲍里斯空袭 / 常规 AttackTask。 */
  process(): any {
    if (this.isC4) return [new PlantC4Task(this.game, this.target.obj)];
    // Boris airstrike — if the unit has AirstrikeTrait and the target is a
    // building, create an AirstrikeAttackTask instead of a normal AttackTask. This
    // makes Boris point his laser designator at the building and spawn MiG planes.
    const airstrikeWeapon = this.selectAirstrikeWeapon(this.sourceObject, this.target);
    if (airstrikeWeapon && this.target.obj?.isBuilding() && this.sourceObject.airstrikeTrait) {
      // Note: vanilla YR has no "Airstrike confirmed" sound — the airstrike
      // voice ("MiG's on the way") plays later when the MiGs spawn.
      return [new AirstrikeAttackTask(this.game, this.target, airstrikeWeapon, { force: this.forceAttack })];
    }
    // deploy-fire units undeploy before attacking
    const src = this.sourceObject;
    src.isUnit() && src.deployerTrait?.isDeployed() && src.deployerTrait.setDeployed(false);
    const weapon = src.attackTrait.selectWeaponVersus(
      this.sourceObject,
      this.target,
      this.game,
      this.forceAttack,
    );
    return [new AttackTask(this.game, this.target, weapon, { force: this.forceAttack })];
  }

  /**
   * selectAirstrikeWeapon — returns the unit's secondary weapon if it has
   * MigAttackCursor=yes and the unit has AirstrikeTrait (Boris). Returns null if not
   * applicable. This is used to intercept building attacks and redirect to AirstrikeAttackTask.
   */
  selectAirstrikeWeapon(unit: any, target: any): any {
    if (!unit.airstrikeTrait) return null;
    if (!unit.secondaryWeapon) return null;
    if (!unit.secondaryWeapon.rules.migAttackCursor) return null;
    if (!target.obj?.isBuilding()) return null;
    return unit.secondaryWeapon;
  }

  /** 入队：飞行单位取消可插队任务；地面载具挂速度惩罚；时空武器改写现有 AttackTask。 */
  onAdd(tasks: any, isReplacing: any): boolean {
    const src = this.sourceObject;
    if (!isReplacing && src.isUnit() && this.isValid() && this.isAllowed())
      if (src.rules.movementZone === MovementZone.Fly) {
        const existing = tasks.find(
          (task: any) => (task.constructor === MoveTask || task.constructor === AttackTask) && !task.isCancelling(),
        );
        let cancelTask: any;
        let weapon: any;
        if (
          existing &&
          (src.moveTrait.currentWaypoint?.tile === this.target.tile ||
            src.isAircraft() ||
            existing.constructor === AttackTask ||
            ((weapon = this.sourceObject.attackTrait.selectWeaponVersus(
              this.sourceObject,
              this.target,
              this.game,
              this.forceAttack,
            )),
            weapon.projectileRules.vertical &&
              existing.constructor === MoveTask &&
              this.rangeHelper.isInWeaponRange(
                this.sourceObject,
                this.target.obj || this.target.tile,
                weapon,
                this.game.rules,
              )))
        )
          cancelTask = existing;
        cancelTask?.forceCancel(src) && tasks.splice(tasks.indexOf(cancelTask));
      } else {
        tasks.length &&
          src.isUnit() &&
          (src.rules.locomotor === LocomotorType.Vehicle || src.rules.locomotor === LocomotorType.Ship) &&
          (src.moveTrait.speedPenalty = 0.5);
        const attackTask = tasks.find((task: any) => task.constructor === AttackTask && !task.isCancelling());
        if (attackTask?.getWeapon().warhead.rules.temporal)
          return (attackTask.setForceAttack(this.forceAttack), attackTask.requestTargetUpdate(this.target), false);
      }
    return true;
  }
}
