/**
 * keyNames — 键盘 keyCode → 可读名称映射。
 *
 * getKeyName 查 Map，未收录的码回退 String.fromCharCode；
 * 数字键盘与 F1–F32 由数组展开生成。由 util/keyNames.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 特殊键 keyCode → 显示名（含数字键盘与 F 区展开）。 */
const keyNameMap = new Map<number, string>([
  [8, "Backspace"],
  [9, "Tab"],
  [12, "Clear"],
  [13, "Enter"],
  [19, "Pause/Break"],
  [20, "CapsLock"],
  [27, "Esc"],
  [32, "Space"],
  [33, "PageUp"],
  [34, "PageDown"],
  [35, "End"],
  [36, "Home"],
  [37, "ArrowLeft"],
  [38, "ArrowUp"],
  [39, "ArrowRight"],
  [40, "ArrowDown"],
  [44, "PrintScreen"],
  [45, "Insert"],
  [46, "Delete"],
  [91, "LeftWin/⌘"],
  [92, "RightWin/⌘"],
  ...new Array(10).fill(0).map((_, i) => [96 + i, "Num" + i] as [number, string]),
  [106, "Num*"],
  [107, "Num+"],
  [109, "Num-"],
  [110, "NumDel"],
  [111, "Num/"],
  ...new Array(32).fill(0).map((_, i) => [111 + i + 1, "F" + (i + 1)] as [number, string]),
  [144, "NumLock"],
  [145, "ScrollLock"],
  [186, ";"],
  [187, "="],
  [188, ","],
  [189, "-"],
  [190, "."],
  [191, "/"],
  [192, "`"],
  [219, "["],
  [220, "\\"],
  [221, "]"],
  [222, "'"],
]);

/** 查可读键名；未映射的 keyCode 转为单字符字符串。 */
export function getKeyName(keyCode: number): string {
  const name = keyNameMap.get(keyCode);
  return name !== undefined ? name : String.fromCharCode(keyCode);
}
