/**
 * DMislRules — 德罗普飞船（Drop Pod 母舰）导弹规则。
 *
 * DMisl 导弹弹道参数。继承自 MissileRules 基类；键名前缀 DMisl。
 * 由 game/rules/general/DMislRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MissileRules } from "game/rules/general/MissileRules";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DMislRules extends MissileRules {
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
  /** 弹体 INI 名 */
  type: any;

  /** 从 [General] 段读取本组键（链式返回 this）。 */
  readIni(ini: any): this {
    this.pauseFrames = ini.getNumber("DMislPauseFrames");
    this.tiltFrames = ini.getNumber("DMislTiltFrames");
    this.pitchInitial = ini.getNumber("DMislPitchInitial");
    this.pitchFinal = ini.getNumber("DMislPitchFinal");
    this.turnRate = ini.getNumber("DMislTurnRate");
    this.acceleration = ini.getNumber("DMislAcceleration");
    this.altitude = ini.getNumber("DMislAltitude");
    this.damage = ini.getNumber("DMislDamage");
    this.eliteDamage = ini.getNumber("DMislEliteDamage");
    this.bodyLength = ini.getNumber("DMislBodyLength");
    this.lazyCurve = ini.getBool("DMislLazyCurve");
    this.type = ini.getString("DMislType");
    return this;
  }
}
