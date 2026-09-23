/**
 * 展示层格式化工具。
 *
 * 由 util/format.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { pad } from "util/string"; // 孪生

/**
 * 将秒数格式化为 `h:mm:ss` / `mm:ss` 时长字符串。
 *
 * @param totalSeconds 总秒数（假定为非负整数；小数部分由 floor 截断）。
 * @param alwaysShowHours 为 true 时即使 h=0 也输出小时段；默认 false。
 *
 * 分/秒恒用 pad(x, "00") 补足两位；时段仅在 h≠0 或 alwaysShowHours 时出现。
 */
export function formatTimeDuration(totalSeconds: number, alwaysShowHours = false): string {
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds -= 3600 * hours;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = (totalSeconds -= 60 * minutes);
  return [...(hours || !alwaysShowHours ? [hours] : []), pad(minutes, "00"), pad(seconds, "00")].join(":");
}
