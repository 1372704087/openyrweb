/**
 * ShadowQuality — 阴影质量档位枚举（Off/Low/Medium/High）。
 *
 * 由 engine/renderable/entity/unit/ShadowQuality.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum ShadowQuality {
  /** 关闭阴影。 */
  Off = 0,
  /** 低质量阴影。 */
  Low = 1,
  /** 中等质量阴影。 */
  Medium = 2,
  /** 高质量阴影。 */
  High = 3,
}
