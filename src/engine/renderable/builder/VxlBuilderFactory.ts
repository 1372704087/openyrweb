/**
 * VxlBuilderFactory — 按 useBatching 开关创建 Batched / NonBatched VXL 构建器。
 *
 * 由 engine/renderable/builder/VxlBuilderFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as VxlBatchedBuilderModule from "engine/renderable/builder/VxlBatchedBuilder"; // 孪生
import * as VxlNonBatchedBuilderModule from "engine/renderable/builder/VxlNonBatchedBuilder"; // 孪生

const VxlBatchedBuilder = (VxlBatchedBuilderModule as any)
  .VxlBatchedBuilder as any;
const VxlNonBatchedBuilder = (VxlNonBatchedBuilderModule as any)
  .VxlNonBatchedBuilder as any;

/**
 * VXL 构建器工厂。
 * useBatching 为真走 VxlBatchedBuilder（多调色板），否则走 VxlNonBatchedBuilder。
 */
export class VxlBuilderFactory {
  /**
   * @param vxlGeometryPool - 共享几何池
   * @param useBatching - 是否批量
   * @param camera - 相机
   */
  constructor(
    private vxlGeometryPool: any,
    private useBatching: boolean,
    private camera: any,
  ) {
    (this.vxlGeometryPool = vxlGeometryPool),
      (this.useBatching = useBatching),
      (this.camera = camera);
  }

  /**
   * 创建具体构建器。
   * @param e - vxlFile
   * @param t - hvaFile
   * @param i - palettes（批量）或单 palette 位（非批量用 r）
   * @param r - 当前 palette（非批量）/ 多余参数位（与孪生参数序一致）
   */
  create(e: any, t: any, i: any, r: any): any {
    return this.useBatching
      ? new VxlBatchedBuilder(e, t, i, r, this.vxlGeometryPool, this.camera)
      : new VxlNonBatchedBuilder(
          e,
          t,
          r,
          this.vxlGeometryPool,
          this.camera,
        );
  }
}
