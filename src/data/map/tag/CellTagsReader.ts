/**
 * CellTagsReader — 地图 [CellTags] 节读取器。
 *
 * 将 CellTags 节的 key=value 对解析为结构化条目列表：
 *  - key 为格子编码（AZ 编码的十进制形式），value 为 TagId；
 *  - readCoords 按地图尺寸解码：尺寸参数 <4 时按 128 列/行（小图），
 *    否则按 1000 列/行；得到 { x: code % cols, y: floor(code / cols) }。
 *
 * 由 data/map/tag/CellTagsReader.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
export class CellTagsReader {
  /**
   * 读取 CellTags 节条目。
   * @param section 地图节对象，需含 entries 迭代器（[key, tagId] 对）
   * @param sizeMap 尺寸参数（<4 视为 128 列小图，否则 1000 列）
   * @returns 解码后的 { tagId, coords } 列表
   */
  read(section: any, sizeMap: number): { tagId: any; coords: { x: number; y: number } }[] {
    const result: { tagId: any; coords: { x: number; y: number } }[] = [];
    for (var [key, tagId] of section.entries) {
      const entry = { tagId, coords: this.readCoords(Number(key), sizeMap) };
      result.push(entry);
    }
    return result;
  }

  /**
   * 将格子编码解码为坐标。
   * @param code 格子十进制编码
   * @param sizeMap 尺寸参数（<4 → 128 列，否则 1000 列）
   */
  readCoords(code: number, sizeMap: number): { x: number; y: number } {
    const cols = sizeMap < 4 ? 128 : 1000;
    return { x: code % cols, y: Math.floor(code / cols) };
  }
}
