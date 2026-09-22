/**
 * InflictDamageEvent — 造成伤害事件。
 *
 * 一次伤害结算命中目标时派发（与 HealthChangeEvent 区分：本事件
 * 携带攻击者与本次伤害量，用于战斗音效、击杀归属统计等）。
 *
 * 由 game/event/InflictDamageEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class InflictDamageEvent {
  /** 受伤目标。 */
  readonly target: any;
  /** 伤害来源（攻击者对象）。 */
  readonly attacker: any;
  /** 本次造成的伤害（HP 点数）。 */
  readonly damageHitPoints: number;
  /** 结算后的当前生命值。 */
  readonly currentHealth: number;
  /** 结算前的生命值。 */
  readonly prevHealth: number;
  readonly type: number;

  constructor(
    target: any,
    attacker: any,
    damageHitPoints: number,
    currentHealth: number,
    prevHealth: number,
  ) {
    this.target = target;
    this.attacker = attacker;
    this.damageHitPoints = damageHitPoints;
    this.currentHealth = currentHealth;
    this.prevHealth = prevHealth;
    this.type = EventType.InflictDamage;
  }
}
