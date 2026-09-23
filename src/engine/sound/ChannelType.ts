/**
 * ChannelType — 音频输出通道枚举（混音器分路）。
 *
 * 每个通道对应 AudioSystem 中一条 GainNode 支路：Master 直连 destination，
 * Effect 经 DynamicsCompressor 后入 Master，其余并入 Master。
 *
 * 由 engine/sound/ChannelType.ts.js 重写为 TS（行为完全一致，枚举值与
 * 孪生逐值对齐）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 *
 * 数值稳定性：请勿重排或重编号 —— createChannels 按 Object.keys 枚举数值，
 * serialize 后的通道号也需与孪生一致。
 */
export enum ChannelType {
  /** 主总线：所有其它通道的汇合点，直连 AudioContext.destination。 */
  Master = 0,
  /** UI 音效：按钮、菜单点击等界面反馈。 */
  Ui = 1,
  /** 环境声：地图上的氛围/环境循环音。 */
  Ambient = 2,
  /** 战斗/技能特效：经压缩器后入主总线。 */
  Effect = 3,
  /** 语音：EVA 播报与单位语音。 */
  Voice = 4,
  /** 背景音乐。 */
  Music = 5,
  /** 片尾字幕滚动刻度音。 */
  CreditTicks = 6,
}
