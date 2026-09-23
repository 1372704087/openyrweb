/**
 * getHumanReadableKey — 键盘事件 → 可读组合键字符串。
 *
 * Ctrl/Shift 原样；mac/iPad 用 ⌥/⌘，否则 Alt/Win。
 * 无 keyCode 时结尾仍拼 `+`（保留孪生笔误）。
 *
 * 由 gui/screen/options/component/getHumanReadableKey.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { getKeyName } from "util/keyNames"; // 已转换
import { isMac, isIpad } from "util/userAgent"; // 已转换

/**
 * 将 KeyboardEvent 类对象转为 `Ctrl+Shift+A` 等可读串。
 * keyCode 未定义时返回 `modifiers+`（末尾多一个 `+`）。
 */
export const getHumanReadableKey = (e: {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  keyCode?: number;
}): string => {
  var apple = isMac() || isIpad();
  let parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push(apple ? "⌥" : "Alt");
  if (e.shiftKey) parts.push("Shift");
  if (e.metaKey) parts.push(apple ? "⌘" : "Win");
  return void 0 !== e.keyCode
    ? (parts.push(getKeyName(e.keyCode)), parts.join("+"))
    : parts.join("+") + "+";
};
