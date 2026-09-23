/**
 * SpecialFlags — 地图特殊标志（[SpecialFlags] 节）。
 *
 * 孪生仅导出 initialVeteran 一个布尔；read 从 IniSection 取
 * "InitialVeteran"（yes/1/true/on 等为 true）。
 *
 * 由 data/map/SpecialFlags.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import type { IniSection } from '../IniSection';

export class SpecialFlags {
  /** 新单位是否直接为精英/老兵。 */
  initialVeteran?: boolean;

  /** 从节读取全部标志并返回 this。 */
  read(section: IniSection): this {
    this.initialVeteran = section.getBool('InitialVeteran');
    return this;
  }
}
