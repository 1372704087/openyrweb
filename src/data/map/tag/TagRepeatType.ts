/**
 * TagRepeatType — 地图标签(Tag)的重复触发模式枚举。
 *
 * 由 data/map/tag/TagRepeatType.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 用途：INImap 标签行 `Id=RepeatType,Name,TriggerId` 中的 RepeatType 数字，
 * 决定绑定到该标签的触发器只触发一次还是可反复触发。
 *
 * 数值稳定性：与孪生枚举值逐值一致，勿重排或重编号。
 */
export enum TagRepeatType {
  /** 任一条件满足即触发一次后失效。 */
  OnceAny = 0,
  /** 全部条件同时满足才触发一次后失效。 */
  OnceAll = 1,
  /** 条件可反复满足并重复触发。 */
  Repeat = 2,
}
