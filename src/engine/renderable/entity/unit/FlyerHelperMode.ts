/**
 * FlyerHelperMode — 飞行辅助线显示模式枚举（始终/选中时/从不）。
 *
 * 由 engine/renderable/entity/unit/FlyerHelperMode.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum FlyerHelperMode {
  /** 始终显示辅助线。 */
  Always = 0,
  /** 仅选中时显示。 */
  Selected = 1,
  /** 从不显示。 */
  Never = 2,
}
