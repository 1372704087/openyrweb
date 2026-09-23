/**
 * VxlGeometryPool — section 几何池：缓存 / 质量档 / 存储读写透传。
 *
 * 由 engine/renderable/builder/vxlGeometry/VxlGeometryPool.ts.js 重写为 TS
 * （行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ModelQualityModule from "engine/renderable/entity/unit/ModelQuality"; // 孪生
import * as typeGuardModule from "util/typeGuard"; // 孪生
import * as VxlGeometryMonotoneBuilderModule from "engine/renderable/builder/vxlGeometry/VxlGeometryMonotoneBuilder"; // 孪生

const ModelQuality = (ModelQualityModule as any).ModelQuality as any;
const isNotNullOrUndefined = (typeGuardModule as any)
  .isNotNullOrUndefined as any;
const VxlGeometryMonotoneBuilder = (VxlGeometryMonotoneBuilderModule as any)
  .VxlGeometryMonotoneBuilder as any;

/**
 * VXL 几何缓存池。
 * get() 未命中时用 VxlGeometryMonotoneBuilder 构建并写回；
 * 另转发 load/persist/clear 到底层 cache。
 */
export class VxlGeometryPool {
  private modelQuality: any;

  /**
   * @param cache - 底层几何/存储缓存
   * @param modelQuality - 模型质量档（默认 High）
   */
  constructor(
    private cache: any,
    modelQuality: any = ModelQuality.High,
  ) {
    (this.cache = cache), (this.modelQuality = modelQuality);
  }

  /**
   * 设置模型质量档。
   * @param e - 质量枚举
   */
  setModelQuality(e: any): void {
    this.modelQuality = e;
  }

  /** 读取当前质量档。 */
  getModelQuality(): any {
    return this.modelQuality;
  }

  /**
   * 从存储批量加载各 section 几何。
   * @param e - vxlFile
   * @param t - 存储上下文
   * @returns 全部成功则为 true
   */
  async loadFromStorage(e: any, t: any): Promise<boolean> {
    const i = await Promise.all(
      e.sections.map((sec: any) => this.cache.loadFromStorage(sec, t)),
    );
    return i.every(isNotNullOrUndefined);
  }

  /**
   * 持久化各 section 几何。
   * @param e - vxlFile
   * @param t - 存储上下文
   * @param i - 与 sections 对齐的结果数组
   */
  async persistToStorage(e: any, t: any, i: any[]): Promise<void> {
    for (let s = 0; s < e.sections.length; s++) {
      await this.cache.persistToStorage(e.sections[s], t, i[s]);
    }
  }

  /** 清空内存缓存。 */
  clear(): void {
    this.cache.clear();
  }

  /** 清空持久化存储。 */
  async clearStorage(): Promise<void> {
    await this.cache.clearStorage();
  }

  /** 清除其它 mod 的持久化存储。 */
  async clearOtherModStorage(): Promise<void> {
    await this.cache.clearOtherModStorage();
  }

  /**
   * 取（或构建并缓存）section 几何。
   * @param e - VXL section
   */
  get(e: any): any {
    let t = this.cache.get(e);
    if (!t) {
      t = new VxlGeometryMonotoneBuilder().build(e);
      this.cache.set(e, t);
    }
    return t;
  }
}
