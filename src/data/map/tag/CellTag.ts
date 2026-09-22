/**
 * CellTag — 单元格绑定的 Tag 记录（[CellTags] 段解析结果）。
 *
 * 原始孪生为空模块（type-only）；此处按 CellTagsReader / TriggerManager
 * 的实际读写字段补全接口，便于 TS 侧引用，运行时无导出。
 *
 * 由 data/map/tag/CellTag.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export interface CellTag {
  /** 关联的 Tag id（字符串键，与 TagsReader 读出的 id 一致）。 */
  tagId: string;
  /** 单元格坐标（由 CellTagsReader.readCoords 按地图尺寸解码）。 */
  coords: { x: number; y: number };
}
