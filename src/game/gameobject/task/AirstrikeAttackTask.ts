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
    // 走位进入射程子任务创建后置位；走完后（Boris 在射程边缘静止）再打信号弹。
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
    // 发射信号弹会触发 AirstrikeTrait 分发器（原版
    // InfantryClass::SpecialAttack → AirstrikeClass::Update）：要么立刻
    // 生成 MiG 编队（Execute），要么把已在空中的编队改指向新目标
    // （ChangeTarget）。两者都是立刻生效。
    const targetObj = this.target.obj;
    const targetTile = targetObj ? targetObj.tile : this.target.tile;
    if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
      return false;
    }
    // VoiceSecondaryWeaponAttack 语音已在 onStart 下令时播过；发射信号弹
    // 只触发空袭状态机（生成/改向飞机）。
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
    // 原版 YR：下令空袭时 Boris 立刻播 VoiceSecondaryWeaponAttack 语音
    // （如 BorisAirstrikeVoice），无论是否已在信号弹射程内、是否还要先走过去。
    // （此前只在扔信号弹时播，超射程下令时没有即时反馈。）
    const voice = gameObject.rules.voiceSecondaryWeaponAttack;
    if (voice) {
      this.game.events.dispatch(new TriggerSoundFxEventModule.TriggerSoundFxEvent(voice, gameObject.tile));
    }
    // 使用标准武器射程判定（感知占地，与主武器和 MoveInWeaponRangeTask
    // 同一套），确保 Boris 完全走入信号弹射程后再开火。
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
    // 阶段 Firing — 空袭已发射（飞机已生成或改向），之后由 trait 管理飞机。
    if (this.phase === Phase.Firing) {
      return true;
    }
    // 阶段 Approaching — 把 Boris 移入武器射程后再开火。
    const targetObj = this.target.obj;
    const targetTile = targetObj ? targetObj.tile : this.target.tile;
    if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
      return true;
    }
    // 等走位结束：MoveInWeaponRangeTask 会把 Boris 停在信号弹射程内第一个
    // 途经点，等它完成后再开火意味着信号弹发射时 Boris 已静止——若中途
    // 取消走位，会多走出几步并打断激光指示。
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
    // 超射程 — 走进射程。移动任务接收目标对象/地块，与普通 AttackTask
    // 完全一致。此处传入 Target 对象曾破坏 MoveTask 寻路（MoveTask 直接读
    // targetTile.rx/ry，Target 并不暴露），导致 Boris 从不走进射程、只在
    // 远处扔信号弹。
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
