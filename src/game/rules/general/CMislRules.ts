/**
 * CMislRules — 巡航导弹（战列舰舰炮支援/雷鸣攻击）规则。
 *
 * CMisl 巡航导弹弹道参数（比 V3 多一个爬升率）。继承自 MissileRules 基类；键名前缀 CMisl。
 * 由 game/rules/general/CMislRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MissileRules } from "game/rules/general/MissileRules";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CMislRules extends MissileRules {
  /** 爬升速率 */
  raiseRate: any;
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
    this.raiseRate = ini.getNumber("CMislRaiseRate");
    this.pauseFrames = ini.getNumber("CMislPauseFrames");
    this.tiltFrames = ini.getNumber("CMislTiltFrames");
    this.pitchInitial = ini.getNumber("CMislPitchInitial");
    this.pitchFinal = ini.getNumber("CMislPitchFinal");
    this.turnRate = ini.getNumber("CMislTurnRate");
    this.acceleration = ini.getNumber("CMislAcceleration");
    this.altitude = ini.getNumber("CMislAltitude");
    this.damage = ini.getNumber("CMislDamage");
    this.eliteDamage = ini.getNumber("CMislEliteDamage");
    this.bodyLength = ini.getNumber("CMislBodyLength");
    this.lazyCurve = ini.getBool("CMislLazyCurve");
    this.type = ini.getString("CMislType");
    return this;
  }
}
