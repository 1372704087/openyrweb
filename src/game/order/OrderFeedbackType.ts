/**
 * OrderFeedbackType — 指令反馈类型（决定下令时播放哪条语音/UI 反馈）。
 *
 * 由 game/order/OrderFeedbackType.ts.js 重写为 TS（行为完全一致，枚举值
 * 脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum OrderFeedbackType {
  /** 无反馈 */
  None = 0,
  /** 移动 */
  Move = 1,
  /** 攻击 */
  Attack = 2,
  /** 进入 */
  Enter = 3,
  /** 占领 */
  Capture = 4,
  /** 特殊攻击（C4 等） */
  SpecialAttack = 5,
  /** 副武器攻击语音 */
  SecondaryWeaponAttack = 6,
}
