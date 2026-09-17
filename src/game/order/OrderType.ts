/**
 * OrderType — 玩家指令类型（右键/键盘发出的命令序号）。
 *
 * 由 game/order/OrderType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum OrderType {
  /** 移动 */
  Move = 0,
  /** 强制移动 */
  ForceMove = 1,
  /** 攻击 */
  Attack = 2,
  /** 强制攻击 */
  ForceAttack = 3,
  /** 攻击移动 */
  AttackMove = 4,
  /** 警戒 */
  Guard = 5,
  /** 区域警戒 */
  GuardArea = 6,
  /** 占领 */
  Capture = 7,
  /** 驻扎 */
  Occupy = 8,
  /** 部署 */
  Deploy = 9,
  /** 部署（选中） */
  DeploySelected = 10,
  /** 停止 */
  Stop = 11,
  /** 欢呼 */
  Cheer = 12,
  /** 进坞 */
  Dock = 13,
  /** 集合 */
  Gather = 14,
  /** 修理 */
  Repair = 15,
  /** 散开 */
  Scatter = 16,
  /** 进入运输车 */
  EnterTransport = 17,
  /** 安放炸弹 */
  PlaceBomb = 18,
  /** 全部卸载 */
  UnloadAll = 19,
}
