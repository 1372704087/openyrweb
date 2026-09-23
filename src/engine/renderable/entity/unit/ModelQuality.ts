/**
 * ModelQuality — 模型质量档位枚举（Low/High）。
 *
 * 由 engine/renderable/entity/unit/ModelQuality.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum ModelQuality {
  /** 低质量模型。 */
  Low = 0,
  /** 高质量模型。 */
  High = 1,
}
