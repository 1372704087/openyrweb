/**
 * V3RocketRules — V3 火箭发射车导弹规则。
 *
 * V3 火箭弹道参数（S 形懒弧线可选）。继承自 MissileRules 基类；键名前缀 V3Rocket。
 * 由 game/rules/general/V3RocketRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MissileRules } from "game/rules/general/MissileRules";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class V3RocketRules extends MissileRules {
  /** 发射前停顿帧数 */
  pauseFrames: any;
  /** 起竖帧数 */
  tiltFrames: any;
  /** 初始俯仰角 */
  pitchInitial: any;
  /** 最终俯仰角 */
  pitchFinal: any;
  /** 转向速率 */
  turnRate: any;
  /** 加速度 */
  acceleration: any;
  /** 巡航高度 */
  altitude: any;
  /** 常规伤害 */
  damage: any;
  /** 精英级伤害 */
  eliteDamage: any;
  /** 弹体长度（渲染/碰撞） */
  bodyLength: any;
  /** 懒弧线（绕行弹道） */
  lazyCurve: any;
  /** 弹体 INI 名（getMissileRules 据此匹配） */
  type: any;

  /** 从 [General] 段读取本组键（链式返回 this）。 */
  readIni(ini: any): this {
    this.pauseFrames = ini.getNumber("V3RocketPauseFrames");
    this.tiltFrames = ini.getNumber("V3RocketTiltFrames");
    this.pitchInitial = ini.getNumber("V3RocketPitchInitial");
    this.pitchFinal = ini.getNumber("V3RocketPitchFinal");
    this.turnRate = ini.getNumber("V3RocketTurnRate");
    this.acceleration = ini.getNumber("V3RocketAcceleration");
    this.altitude = ini.getNumber("V3RocketAltitude");
    this.damage = ini.getNumber("V3RocketDamage");
    this.eliteDamage = ini.getNumber("V3RocketEliteDamage");
    this.bodyLength = ini.getNumber("V3RocketBodyLength");
    this.lazyCurve = ini.getBool("V3RocketLazyCurve");
    this.type = ini.getString("V3RocketType");
    return this;
  }
}
