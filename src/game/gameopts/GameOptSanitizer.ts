/**
 * GameOptSanitizer — 对局选项数值钳制（资金/速度/单位数）。
 *
 * 在进入战局前把 GameOpts 里的越界数值夹到 MpDialogSettings 或固定区间内：
 *  - credits   → [minMoney, maxMoney]
 *  - gameSpeed → [0, 6]（原版速度档位）
 *  - unitCount → [minUnitCount, maxUnitCount]
 * 均先 clamp 再取整（Math.floor）。
 *
 * 由 game/gameopts/GameOptSanitizer.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class GameOptSanitizer {
  /**
   * 就地钳制对局选项中的数值字段。
   * @param opts 待处理的对局选项对象
   * @param rules 含 mpDialogSettings 的规则容器
   */
  static sanitize(opts: any, rules: any): void {
    const settings = rules.mpDialogSettings;
    opts.credits = Math.floor(clamp(opts.credits, settings.minMoney, settings.maxMoney));
    opts.gameSpeed = Math.floor(clamp(opts.gameSpeed, 0, 6));
    opts.unitCount = Math.floor(clamp(opts.unitCount, settings.minUnitCount, settings.maxUnitCount));
  }
}
