/**
 * CurvePath — 在 THREE.CurvePath 上补充闭合路径。
 *
 * closePath：若首尾控制点不重合，则追加一条 LineCurve 把终点接回起点。
 *
 * 由 game/math/CurvePath.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { LineCurve } from "game/math/LineCurve"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
const BaseCurvePath: any = (THREE as any).CurvePath;

export class CurvePath extends BaseCurvePath {
  /** 用 LineCurve 连接末曲线终点与首曲线起点（已重合则不追加）。 */
  closePath(): void {
    const first = this.curves[0].getPoint(0);
    const last = this.curves[this.curves.length - 1].getPoint(1);
    if (!first.equals(last)) this.curves.push(new LineCurve(last, first));
  }
}
