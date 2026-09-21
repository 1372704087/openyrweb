/**
 * AirstrikeAttackTask — 鲍里斯空袭攻击任务（进射程后打信号弹触发空袭）。
 *
 * 把 Boris 走进 Flare 射程后开火；开火会驱动 AirstrikeTrait 状态机
 * （原版 AirstrikeClass::Update）：立刻生成 MiG 编队（Execute），或把
 * 已在空中的编队改指向新目标（ChangeTarget）。编队与冷却由 trait 自管。
 *
 *  - onStart：无 airstrikeTrait / 未就绪则 cancel；立刻播
 *    VoiceSecondaryWeaponAttack；已在射程则直接 Firing 并开火，
 *    否则 Approaching；
 *  - onTick Approaching：等 MoveInWeaponRangeTask 走完（避免路径中途
 *    取消带走额外步数打断激光指示）；已就绪或已走完则 Firing+开火；
 *    否则挂非阻塞 MoveInWeaponRangeTask（目标传 obj/tile，非 Target）。
 *
 * 由 game/gameobject/task/AirstrikeAttackTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { MoveInWeaponRangeTask } from "game/gameobject/task/move/MoveInWeaponRangeTask"; // 已转换
import * as TriggerSoundFxEventModule from "game/event/TriggerSoundFxEvent"; // 未转换（any-shim）

/** 空袭阶段（模块私有，与孪生一致不对外导出）。 */
const Phase = {
  /** Boris 移动进入武器射程。 */
  Approaching: 0,
  /** 信号弹已发射，编队已生成/改向 — 任务完成。 */
  Firing: 1,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AirstrikeAttackTask extends Task {
  game: any;
  target: any;
  weapon: any;
  options: any;
  phase: number;
  fired: boolean;
  /** 走位子任务已创建；走完后（Boris 在射程边缘静止）再打信号弹。 */
  _walkDone: boolean;
  rangeHelper: any;
  targetLinesConfig: any;

  constructor(game: any, target: any, weapon: any, options?: any) {
    super();
    this.game = game;
    this.target = target;
    this.weapon = weapon;
    this.options = options || {};
    this.phase = Phase.Approaching;
    this.fired = false;
    // set once the walk-into-range task has been created; after it
    // completes (Boris is stationary at the range edge) the flare is fired.
    this._walkDone = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
    this.targetLinesConfig = { pathNodes: [] };
    this.updateTargetLines(target, true);
    this.preventOpportunityFire = true;
    this.preventLanding = true;
  }

  duplicate(): AirstrikeAttackTask {
    return new AirstrikeAttackTask(this.game, this.target, this.weapon, this.options);
  }

  getWeapon(): any {
    return this.weapon;
  }

  updateTargetLines(target: any, isAttack: boolean): void {
    this.targetLinesConfig.target = target.obj;
    this.targetLinesConfig.pathNodes = target.obj ? [] : [{ tile: target.tile, onBridge: target.getBridge() }];
    this.targetLinesConfig.isAttack = isAttack;
  }

  _fire(gameObject: any): boolean {
    // Firing the Flare triggers the AirstrikeTrait dispatcher (vanilla
    // InfantryClass::SpecialAttack → AirstrikeClass::Update): it either
    // spawns the MiG team (Execute) or redirects the in-flight planes
    // to this new target (ChangeTarget). Both happen instantly.
    const targetObj = this.target.obj;
    const targetTile = targetObj ? targetObj.tile : this.target.tile;
    if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
      return false;
    }
    // The VoiceSecondaryWeaponAttack line already played in onStart when the
    // order was issued; firing the Flare only triggers the airstrike state
    // machine (spawn/redirect planes).
    gameObject.airstrikeTrait.update(this.game, gameObject, targetObj, targetTile);
    this.fired = true;
    return true;
  }

  onStart(gameObject: any): void {
    if (!gameObject.airstrikeTrait) {
      this.cancel();
      return;
    }
    if (!gameObject.airstrikeTrait.isReady(gameObject)) {
      this.cancel();
      return;
    }
    const targetObj = this.target.obj;
    const targetTile = targetObj ? targetObj.tile : this.target.tile;
    // Vanilla YR: Boris speaks his VoiceSecondaryWeaponAttack line (e.g.
    // BorisAirstrikeVoice) when the airstrike is ordered — immediately,
    // whether he is already in the Flare's range or must walk there first.
    // (Previously the voice only played at the flare throw, so an
    // out-of-range order gave no immediate feedback.)
    const voice = gameObject.rules.voiceSecondaryWeaponAttack;
    if (voice) {
      this.game.events.dispatch(new TriggerSoundFxEventModule.TriggerSoundFxEvent(voice, gameObject.tile));
    }
    // use the standard weapon-range check (footprint-aware,
    // the same one the primary weapon and the MoveInWeaponRangeTask use)
    // so Boris walks fully into the Flare's range before firing.
    if (
      this.rangeHelper.isInWeaponRange(gameObject, targetObj || targetTile, this.weapon, this.game.rules)
    ) {
      this.phase = Phase.Firing;
      this._fire(gameObject);
    } else {
      this.phase = Phase.Approaching;
    }
  }

  onEnd(gameObject: any): void {
    gameObject.isFiring = false;
  }

  onTick(gameObject: any): boolean {
    if (this.isCancelling()) {
      return true;
    }
    if (!gameObject.airstrikeTrait) {
      return true;
    }
    if (gameObject.isDestroyed || gameObject.isCrashing) {
      return true;
    }
    // Phase: Firing — the strike has been launched (planes spawned or
    // redirected); the trait manages the planes from here on.
    if (this.phase === Phase.Firing) {
      return true;
    }
    // Phase: Approaching — move Boris into weapon range, then fire.
    const targetObj = this.target.obj;
    const targetTile = targetObj ? targetObj.tile : this.target.tile;
    if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
      return true;
    }
    // Wait for the walk to finish: the MoveInWeaponRangeTask stops Boris at
    // the first waypoint inside the Flare's range, so firing after it has
    // completed means Boris is already stationary when the flare goes off —
    // cancelling a mid-path walk instead would carry him a few more steps
    // and interrupt the laser guidance.
    const moveChild = this.children.find((e: any) => e instanceof MoveInWeaponRangeTask);
    if (moveChild) {
      return false;
    }
    if (
      this._walkDone ||
      this.rangeHelper.isInWeaponRange(gameObject, targetObj || targetTile, this.weapon, this.game.rules)
    ) {
      this.phase = Phase.Firing;
      this._fire(gameObject);
      return true;
    }
    // Out of range — walk into range. The move task receives the target
    // object/tile, exactly like a normal AttackTask. Passing a Target
    // object here broke MoveTask pathfinding (MoveTask reads
    // targetTile.rx/ry directly, which a Target does not expose), so Boris
    // never walked into range and just fired the Flare from afar.
    const moveTask = new MoveInWeaponRangeTask(this.game, targetObj || targetTile, false, this.weapon);
    moveTask.blocking = false;
    this._walkDone = true;
    this.children.push(moveTask);
    return false;
  }

  getTargetLinesConfig(): any {
    return this.targetLinesConfig;
  }
}
