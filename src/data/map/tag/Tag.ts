/**
 * Tag — 地图标签（[Tags] 节）数据载体。
 *
 * 孪生中该类为空壳（仅占位导出），字段由 TagsReader 等外部挂载；
 * 此处保持一致：不声明任何自有成员，避免行为差异。
 *
 * 由 data/map/tag/Tag.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Tag {}
