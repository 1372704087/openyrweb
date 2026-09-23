/**
 * DebrisRules — 碎片/残骸规则（爆炸抛洒物的物理与动画参数）。
 *
 * 由 game/rules/DebrisRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { clamp } from "util/math"; // 已转换
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class DebrisRules extends ObjectRules {
  /** 落地伤害。 */
  damage: number;
  /** 爆炸伤害半径。 */
  damageRadius: number;
  /** 存活时长（tick）。 */
  duration: number;
  /** 弹性系数（0–1，缺省 0.75）。 */
  elasticity: number;
  /** 过期动画名（空串 → undefined）。 */
  expireAnim: string | undefined;
  /** 最小角速度。 */
  minAngularVelocity: number;
  /** 最大角速度。 */
  maxAngularVelocity: number;
  /** XY 平面最大速度。 */
  maxXYVel: number;
  /** 最小 Z 速度。 */
  minZVel: number;
  /** 最大 Z 速度。 */
  maxZVel: number;
  /** 是否共享炮塔数据。 */
  shareTurretData: boolean;
  /** 是否共享车体数据。 */
  shareBodyData: boolean;
  /** 是否共享炮管数据。 */
  shareBarrelData: boolean;
  /** 共享来源名（空串 → undefined）。 */
  shareSource: string | undefined;
  /** 拖尾动画名（空串 → undefined）。 */
  trailerAnim: string | undefined;
  /** 拖尾间距。 */
  trailerSeparation: number;
  /** 使用的弹头名（空串 → undefined）。 */
  warhead: string | undefined;

  parse(): void {
    super.parse();
    this.damage = this.ini.getNumber("Damage");
    this.damageRadius = this.ini.getNumber("DamageRadius");
    this.duration = this.ini.getNumber("Duration");
    this.elasticity = clamp(this.ini.getNumber("Elasticity", 0.75), 0, 1);
    this.expireAnim = this.ini.getString("ExpireAnim") || undefined;
    this.minAngularVelocity = this.ini.getNumber("MinAngularVelocity");
    this.maxAngularVelocity = this.ini.getNumber("MaxAngularVelocity");
    this.maxXYVel = this.ini.getNumber("MaxXYVel");
    this.minZVel = this.ini.getNumber("MinZVel");
    this.maxZVel = this.ini.getNumber("MaxZVel");
    this.shareTurretData = this.ini.getBool("ShareTurretData");
    this.shareBodyData = this.ini.getBool("ShareBodyData");
    this.shareBarrelData = this.ini.getBool("ShareBarrelData");
    this.shareSource = this.ini.getString("ShareSource") || undefined;
    this.trailerAnim = this.ini.getString("TrailerAnim") || undefined;
    this.trailerSeparation = this.ini.getNumber("TrailerSeperation");
    this.warhead = this.ini.getString("Warhead") || undefined;
  }
}
