/**
 * SequenceType — 步兵/单位动画序列动作枚举（art.ini Sequence 节键名 → 数值）。
 *
 * 数值与原版 YR ScriptType/序列动作对齐；含双向映射（数字 ↔ 名称），
 * SequenceReader 用名称索引本枚举。
 *
 * 由 game/art/SequenceType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取
 * 自原文件）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */

/** 动画序列类型。 */
export enum SequenceType {
  /** 待机（站立）。 */
  Ready = 0,
  /** 警戒。 */
  Guard = 1,
  /** 卧倒。 */
  Prone = 2,
  /** 行走。 */
  Walk = 3,
  /** 举枪开火。 */
  FireUp = 4,
  /** 卧倒中（姿态过渡）。 */
  Down = 5,
  /** 匍匐前进。 */
  Crawl = 6,
  /** 由卧倒起身。 */
  Up = 7,
  /** 卧姿开火。 */
  FireProne = 8,
  /** 待机变体 1。 */
  Idle1 = 9,
  /** 待机变体 2。 */
  Idle2 = 10,
  /** 死亡动画 1。 */
  Die1 = 11,
  /** 死亡动画 2。 */
  Die2 = 12,
  /** 悬停（旋翼机）。 */
  Hover = 13,
  /** 飞行。 */
  Fly = 14,
  /** 飞行开火。 */
  FireFly = 15,
  /** 翻滚/失控。 */
  Tumble = 16,
  /** 空中死亡开始。 */
  AirDeathStart = 17,
  /** 空中死亡下坠。 */
  AirDeathFalling = 18,
  /** 空中死亡结束。 */
  AirDeathFinish = 19,
  /** 履带推进。 */
  Tread = 20,
  /** 游泳。 */
  Swim = 21,
  /** 水面开火。 */
  WetAttack = 22,
  /** 水面待机 1。 */
  WetIdle1 = 23,
  /** 水面待机 2。 */
  WetIdle2 = 24,
  /** 水面死亡 1。 */
  WetDie1 = 25,
  /** 水面死亡 2。 */
  WetDie2 = 26,
  /** 展开（Deploy 开始）。 */
  Deploy = 27,
  /** 已展开。 */
  Deployed = 28,
  /** 展开态开火。 */
  DeployedFire = 29,
  /** 展开态待机。 */
  DeployedIdle = 30,
  /** 收起（Undeploy）。 */
  Undeploy = 31,
  /** 空降。 */
  Paradrop = 32,
  /** 欢呼。 */
  Cheer = 33,
  /** 恐慌。 */
  Panic = 34,
  /** 铲土。 */
  Shovel = 35,
  /** 搬运。 */
  Carry = 36,
  /** 副武器开火。 */
  SecondaryFire = 37,
}
