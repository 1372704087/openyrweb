/**
 * Section — HVA 单节变换矩阵容器。
 *
 * 由 data/hva/Section.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 孪生仅导出 getMatrix；matrices 由 HvaFile 解析时挂载。
 */
export class Section {
  /** 段名（解析器填入）。 */
  name: string;
  /** 由解析方挂载的逐帧矩阵数组。 */
  matrices: any;

  /** 按帧下标取变换矩阵。 */
  getMatrix(index: number): any {
    return this.matrices[index];
  }
}
