/**
 * PointerType — 指针光标帧/类型编号（与光标 SHP 帧序对齐）。
 *
 * 由 engine/type/PointerType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum PointerType {
  /** 默认光标 */
  Default = 0,
  /** 小地图光标 */
  Mini = 1,
  /** 可滚屏区域 */
  Scroll = 2,
  /** 不可滚屏区域 */
  NoScroll = 10,
  /** 可选择 */
  Select = 18,
  /** 可移动 */
  Move = 31,
  /** 不可移动 */
  NoMove = 41,
  /** 可移动（小地图） */
  MoveMini = 42,
  /** 无操作（小地图） */
  NoActionMini = 52,
  /** 射程内攻击 */
  AttackRange = 53,
  /** 射程外攻击 */
  AttackNoRange = 58,
  /** 攻击（小地图） */
  AttackMini = 63,
  /** 警戒 */
  Guard = 68,
  /** 警戒（小地图） */
  GuardMini = 73,
  /** 未知光标 1 */
  Unknown1 = 78,
  /** 未知光标 2 */
  Unknown2 = 88,
  /** 可进驻 */
  Occupy = 89,
  /** 不可进驻 */
  NoOccupy = 99,
  /** 进驻（小地图） */
  OccupyMini = 100,
  /** 可部署 */
  Deploy = 110,
  /** 不可部署 */
  NoDeploy = 119,
  /** 未知光标 3 */
  Unknown3 = 120,
  /** 可出售 */
  Sell = 129,
  /** 出售（小地图） */
  SellMini = 139,
  /** 不可出售 */
  NoSell = 149,
  /** 维修 + 移动 */
  RepairMove = 150,
  /** 侧边维修 */
  SideRepair = 170,
  /** 不可维修 */
  NoRepair = 190,
  /** 未知光标 4 */
  Unknown4 = 191,
  /** 未知光标 5 */
  Unknown5 = 199,
  /** 炸药（C4 挂载） */
  Dynamite = 204,
  /** 未知光标 6 */
  Unknown6 = 209,
  /** 未知光标 7 */
  Unknown7 = 214,
  /** 未知光标 8 */
  Unknown8 = 219,
  /** 未知光标 9 */
  Unknown9 = 224,
  /** 未知光标 10 */
  Unknown10 = 229,
  /** 未知光标 11 */
  Unknown11 = 234,
  /** 未知光标 12（原文件拼写 Unknwon12） */
  Unknwon12 = 239,
  /** 未知光标 13 */
  Unknown13 = 249,
  /** 伞兵 */
  Para = 259,
  /** 未知光标 14 */
  Unknown14 = 269,
  /** 风暴 */
  Storm = 279,
  /** 工兵伤害 */
  EngineerDamage = 299,
  /** C4 */
  C4 = 309,
  /** 核弹 */
  Nuke = 319,
  /** 未知光标 16 */
  Unknown16 = 329,
  /** 电力 */
  Power = 339,
  /** 未知光标 17 */
  Unknown17 = 345,
  /** 铁幕 */
  Iron = 346,
  /** 未知光标 18 */
  Unknown18 = 351,
  /** 未知光标 19 */
  Unknown19 = 356,
  /** 超时空 */
  Chrono = 357,
  /** 拆除炸弹 */
  DefuseBomb = 369,
  /** 无操作 */
  NoAction = 384,
  /** 平移 */
  Pan = 385,
  /** 未知光标 21 */
  Unknown21 = 394,
  /** 攻击移动 */
  AttackMove = 404,
  /** 未知光标 23 */
  Unknown23 = 413,
  /** 未知光标 24 */
  Unknown24 = 422,
  /** 未知光标 25 */
  Unknown25 = 431,
  /** 未知光标 26 */
  Unknown26 = 432,
  /** 未知光标 27 */
  Unknown27 = 433,
  /** 未知光标 28 */
  Unknown28 = 434,
  /** 信标 */
  Beacon = 435,
  /** 力场护盾 */
  ForceField = 450,
  /** 无力场护盾 */
  NoForceField = 460,
  /** 变异 */
  Mutate = 470,
  /** 空袭 */
  AirStrike = 480,
  /** 支配 */
  Dominate = 488,
  /** 心灵感应揭示 */
  PsychicReveal = 496,
  /** 间谍机 */
  SpyPlane = 504,
  /** 间谍机（小地图） */
  SpyPlaneMini = 512,
  /** 核弹（小地图） */
  NukeMini = 513,
  /** 风暴（小地图） */
  StormMini = 514,
  /** 心灵感应揭示（小地图） */
  PsychicRevealMini = 515,
  /** 支配（小地图） */
  DominateMini = 516,
}
