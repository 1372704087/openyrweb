/**
 * ExtraLightHelper — 额外光照（extraLight）在 SHP/VXL 材质上的乘算辅助。
 *
 * multiplyShp：color = base + (base+1)*mult（SHP 调色板路径近似）；
 * multiplyVxl：color = base + 2*mult*intensity（VXL 路径）。
 *
 * 由 engine/renderable/entity/unit/ExtraLightHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 额外光照乘算工具。 */
export class ExtraLightHelper {
  /**
   * SHP 路径：out = target + (target.clone().addScalar(1)).multiplyScalar(mult)
   * @param out - 写入目标
   * @param target - 基色
   * @param mult - 乘算系数
   */
  static multiplyShp(out: any, target: any, mult: number): void {
    out.copy(target).add(target.clone().addScalar(1).multiplyScalar(mult));
  }

  /**
   * VXL 路径：out = target + 2*intensity*mult
   * @param out - 写入目标
   * @param target - 基色
   * @param mult - 乘算系数
   * @param intensity - 光照强度
   */
  static multiplyVxl(out: any, target: any, mult: number, intensity: number): void {
    out.copy(target).addScalar(2 * intensity * mult);
  }
}
