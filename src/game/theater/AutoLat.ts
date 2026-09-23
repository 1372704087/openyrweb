/**
 * AutoLat — 地图 LAT（土地类型过渡）/ Ramp 平滑的 tileNum 自动改写。
 *
 * calculate 遍历 tile 列表：先把 CLAT 过渡格改写为目标 LAT 格，再为 LAT 格
 * 根据四邻接通性写入 CLAT 变体 tileNum；RampBase 上按 rampType 与四邻
 * 平地关系写入 RampSmooth 变体。
 *
 * 由 game/theater/AutoLat.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TileCollectionModule from "game/map/TileCollection"; // 孪生（any-shim，未转换）

const TileDirection = (TileCollectionModule as any).TileDirection;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** LAT/Ramp 自动过渡计算器（仅静态方法）。 */
export class AutoLat {
  /**
   * 就地改写 tiles 的 tileNum。
   * @param tiles - tile 集合（需提供 getNeighbourTile）
   * @param tileSets - Theater 的 TileSets 查询（getSetNum/isLAT/isCLAT/…）
   */
  static calculate(tiles: any, tileSets: any): void {
    const setByTile = new Map<any, any>();
    // 第一遍：CLAT → 目标 LAT，并记录每格当前 set
    tiles.forEach((tile: any) => {
      let setNum = tileSets.getSetNum(tile.tileNum);
      setByTile.set(tile, setNum);
      if (tileSets.isCLAT(setNum)) {
        setNum = tileSets.getLAT(setNum);
        setByTile.set(tile, setNum);
        tile.tileNum = tileSets.getTileNumFromSet(setNum);
      }
    });
    // 第二遍：LAT 连通掩码 / RampBase 平滑
    tiles.forEach((tile: any) => {
      const setNum = setByTile.get(tile);
      if (tileSets.isLAT(setNum)) {
        let mask = 0;
        const topRight = tiles.getNeighbourTile(tile, TileDirection.TopRight);
        const bottomRight = tiles.getNeighbourTile(tile, TileDirection.BottomRight);
        const bottomLeft = tiles.getNeighbourTile(tile, TileDirection.BottomLeft);
        const topLeft = tiles.getNeighbourTile(tile, TileDirection.TopLeft);
        if (topRight && tileSets.canConnectTiles(setNum, setByTile.get(topRight))) mask += 1;
        if (bottomRight && tileSets.canConnectTiles(setNum, setByTile.get(bottomRight)))
          mask += 2;
        if (bottomLeft && tileSets.canConnectTiles(setNum, setByTile.get(bottomLeft)))
          mask += 4;
        if (topLeft && tileSets.canConnectTiles(setNum, setByTile.get(topLeft))) mask += 8;
        if (0 < mask) {
          const clatSet = tileSets.getCLATSet(setNum);
          tile.tileNum = tileSets.getTileNumFromSet(clatSet, mask);
        }
      } else if (
        setNum === tileSets.getGeneralValue("RampBase") &&
        !(tile.rampType < 1 || 4 < tile.terrainType)
      ) {
        // 孪生：`4 < t.terrainType` 为继续条件的否定（保留原式，避免"纠正"语义）
        let edge = -1;
        const topRight = tiles.getNeighbourTile(tile, TileDirection.TopRight);
        const bottomRight = tiles.getNeighbourTile(tile, TileDirection.BottomRight);
        const bottomLeft = tiles.getNeighbourTile(tile, TileDirection.BottomLeft);
        const topLeft = tiles.getNeighbourTile(tile, TileDirection.TopLeft);
        switch (tile.rampType) {
          case 1:
            if (topLeft && 0 === topLeft.rampType) edge++;
            if (bottomRight && 0 === bottomRight.rampType) edge += 2;
            break;
          case 2:
            if (topRight && 0 === topRight.rampType) edge++;
            if (bottomLeft && 0 === bottomLeft.rampType) edge += 2;
            break;
          case 3:
            if (bottomRight && 0 === bottomRight.rampType) edge++;
            if (topLeft && 0 === topLeft.rampType) edge += 2;
            break;
          case 4:
            if (bottomLeft && 0 === bottomLeft.rampType) edge++;
            if (topRight && 0 === topRight.rampType) edge += 2;
        }
        if (-1 !== edge) {
          tile.tileNum = tileSets.getTileNumFromSet(
            tileSets.getGeneralValue("RampSmooth"),
            3 * (tile.rampType - 1) + edge,
          );
        }
      }
    });
  }
}
