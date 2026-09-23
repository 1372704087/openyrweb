/**
 * KeyCommand — 键盘命令触发时机枚举（TriggerMode）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/KeyCommand.ts.js 重写为 TS。
 * 注意：孪生运行时导出的命名是 TriggerMode（模块文件名 KeyCommand），
 * 枚举值为 0/1/2 的数字枚举，与孪生保持一致。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/KeyCommand.ts.js 重写为 TS
 * （行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 键盘命令触发时机。 */
export enum TriggerMode {
  /** 仅按下 */
  KeyDown = 0,
  /** 仅抬起 */
  KeyUp = 1,
  /** 按下与抬起均触发 */
  KeyDownUp = 2,
}
