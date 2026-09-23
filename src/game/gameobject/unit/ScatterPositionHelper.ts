/**
 * ScatterPositionHelper — 散开位置查找（为一组单位各找最近可用格）。
 *
 * findPositions：逐个调 findFreeMovePosition，已占用 tile 记入 excluded
 * 避免撞车，返回 Map<单位, {tile, onBridge}>。
 * findFreeMovePosition：以单位所在 tile 为圆心、半径 1 的 RandomTileFinder
 * 环扫；谓词过滤 excludedTiles、桥/平地 eligible、noSlopes 时无斜坡；
 * 取到的格若有障碍（可 ignoredBlockers 忽略）则继续，无则返回。
 * 返回最后一格（含 onBridge 归一化：桥不合格时置 undefined）。
 *
 * 由 game/gameobject/unit/ScatterPositionHelper.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ScatterPositionHelper {
  /** 世界引用（取 map）。 */
  game: any;
  /** 落位合法性判定器。 */
  movePositionHelper: any;

  constructor(game: any) {
    this.game = game;
    this.movePositionHelper = new MovePositionHelperModule.MovePositionHelper(game.map);
  }

  /**
   * 为每个单位找一个不重复的散开格。
   * @param units 待散开单位列表
   * @param options 透传给 findFreeMovePosition 的选项
   * @returns Map<单位, {tile, onBridge}>（找不到的不入 Map）
   */
  findPositions(units: Iterable<any>, options?: any): Map<any, any> {
    const used = new Set();
    const result = new Map();
    for (const unit of units) {
      const pos = this.findFreeMovePosition(unit, used, options);
      if (pos) {
        result.set(unit, pos);
        used.add(pos.tile);
      }
    }
    return result;
  }

  /**
   * 为单个单位找最近可用格。
   * @param unit 目标单位
   * @param excluded 已被本批其他单位占用的 tile 集合
   * @param opts { ignoredBlockers?, excludedTiles?, noSlopes? }
   * @returns { tile, onBridge } 或 undefined
   */
  findFreeMovePosition(
    unit: any,
    excluded: Set<any>,
    { ignoredBlockers, excludedTiles, noSlopes }: any = {},
  ): any {
    const map = this.game.map;
    const fromBridge = unit.onBridge ? map.tileOccupation.getBridgeOnTile(unit.tile) : void 0;
    const finder = new RandomTileFinderModule.RandomTileFinder(
      map.tiles,
      map.mapBounds,
      unit.tile,
      1,
      this.game,
      (tile: any) => {
        if (excludedTiles?.includes(tile)) return false;
        const bridge = map.tileOccupation.getBridgeOnTile(tile);
        return (
          ((bridge && this.movePositionHelper.isEligibleTile(tile, bridge, fromBridge, unit.tile)) ||
            this.movePositionHelper.isEligibleTile(tile, void 0, fromBridge, unit.tile)) &&
          (!noSlopes || tile.rampType === 0)
        );
      },
    );
    let last: any;
    let lastBridge: any;
    for (;;) {
      const tile = finder.getNextTile();
      if (!tile) break;
      last = tile;
      lastBridge = map.tileOccupation.getBridgeOnTile(tile);
      if (lastBridge && !this.movePositionHelper.isEligibleTile(tile, lastBridge, fromBridge, unit.tile))
        lastBridge = void 0;
      if (!excluded.has(tile)) {
        let obstacles = map.terrain.findObstacles({ tile, onBridge: lastBridge }, unit);
        if (ignoredBlockers && ignoredBlockers.length)
          obstacles = obstacles.filter((o: any) => !ignoredBlockers.includes(o.obj));
        if (!obstacles.length) break;
      }
    }
    if (last) return { tile: last, onBridge: lastBridge };
  }
}
