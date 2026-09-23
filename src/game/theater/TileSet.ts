/**
 * TileSet — theater.ini 中的一组地块定义（TileSetN 段）。
 *
 * 由 game/theater/TileSet.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单个 TileSet 段的元数据 + 其条目列表。 */
export class TileSet {
  /** TMP 文件名前缀（FileName=）。 */
  fileName: any;
  /** 集合名（SetName=）。 */
  setName: any;
  /** 集合内 tile 数（TilesInSet=）。 */
  tilesInSet: any;
  /** 本集合的 TileSetEntry 列表（由 TileSets.initTileSets 填充）。 */
  entries: any[];

  constructor(fileName: any, setName: any, tilesInSet: any) {
    this.fileName = fileName;
    this.setName = setName;
    this.tilesInSet = tilesInSet;
    this.entries = [];
  }
}
