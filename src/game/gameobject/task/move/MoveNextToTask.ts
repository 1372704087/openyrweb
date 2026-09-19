/**
 * MoveNextToTask — 走到目标旁边的任务（贴靠/集结/进粉碎机前的靠近）。
 *
 * 继承 MoveTask，与 MoveInsideTask 相对的"停在目标边上"：
 *  - 目的地默认取建筑中心 tile（中心越界回退地基内首个合法格）；
 *    OpenYRWeb 扩展：infantryAbsorb 建筑（步兵吸收，如兵营集结）
 *    走向前/东南边缘的随机一格（从门口聚而不是堆到建筑背面）；
 *    grinding 建筑（粉碎机）走正南边缘中点（大门），让单位从正面进；
 *  - 目标本体加入 ignoredBlockers；closeEnoughTiles = √2
 *    （目标周围一格内都算到位）、strictCloseEnough = true
 *    （不满足就近就算失败，不接受"差不多"的停驻）；
 *  - 可选第三参直接指定目的地 tile（调用方已选好落点时）。
 *
 * 到达判定：
 *  - canStopAtTile：当前格不被目标占用（别站在它头上）且父类判定通过；
 *  - isCloseEnoughToDest：无 closeEnoughTiles 时视为足够近；否则用
 *    RangeHelper 判定与目标的 tile 距离在 [0, closeEnoughTiles] 内
 *    且不占用目标本体。
 *
 * 由 game/gameobject/task/move/MoveNextToTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveNextToTask extends MoveTask {
  /** 要靠近的目标。 */
  target: any;
  /** tile 距离助手（构造时绑定 tileOccupation）。 */
  rangeHelper: any;

  /** 目的地 tile：建筑取中心/门口/边缘（见类注释），其它取所在 tile。 */
  static chooseTargetFoundationTile(target: any, game: any): any {
    if (target.isBuilding()) {
      // InfantryAbsorb：走向前（东南）边缘的随机一格，步兵从入口聚集。
      if (target.rules?.infantryAbsorb) {
        const foundationWidth = target.art.foundation.width;
        const foundationHeight = target.art.foundation.height;
        const baseRx = target.tile.rx;
        const baseRy = target.tile.ry;
        const candidates = [];
        // 南边缘（ry + 高度）一行。
        for (let dx = 0; dx < foundationWidth; dx++) {
          const tile = game.map.tiles.getByMapCoords(baseRx + dx, baseRy + foundationHeight);
          if (tile && game.map.mapBounds.isWithinBounds(tile)) candidates.push(tile);
        }
        // 东边缘（rx + 宽度）一列。
        for (let dy = 0; dy < foundationHeight; dy++) {
          const tile = game.map.tiles.getByMapCoords(baseRx + foundationWidth, baseRy + dy);
          if (tile && game.map.mapBounds.isWithinBounds(tile)) candidates.push(tile);
        }
        // 东南角。
        const corner = game.map.tiles.getByMapCoords(baseRx + foundationWidth, baseRy + foundationHeight);
        if (corner && game.map.mapBounds.isWithinBounds(corner)) candidates.push(corner);
        if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
      }
      // OpenYRWeb: 粉碎机（Grinding=yes）——走向南边缘中点（大门），
      // 让单位从正面进门而不是从任意方向贴上去。
      if (target.rules?.grinding) {
        const grindWidth = target.art.foundation.width;
        const grindHeight = target.art.foundation.height;
        const door = game.map.tiles.getByMapCoords(target.tile.rx + Math.floor(grindWidth / 2), target.tile.ry + grindHeight);
        if (door && game.map.mapBounds.isWithinBounds(door)) return door;
      }
      let tile = target.centerTile;
      if (!game.map.mapBounds.isWithinBounds(tile)) {
        tile =
          game.map.tileOccupation
            .calculateTilesForGameObject(target.tile, target)
            .find((foundationTile: any) => game.map.mapBounds.isWithinBounds(foundationTile)) ?? target.tile;
      }
      return tile;
    }
    return target.tile;
  }

  constructor(game: any, target: any, tile?: any) {
    super(game, undefined !== tile ? tile : MoveNextToTask.chooseTargetFoundationTile(target, game), false, {
      ignoredBlockers: [target],
      closeEnoughTiles: Math.SQRT2,
      strictCloseEnough: true,
    });
    this.target = target;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
  }

  /** 路径走完，或已能停在目标旁边的格子上，都算到达。 */
  hasReachedDestination(object: any): boolean {
    return super.hasReachedDestination(object) || this.canStopAtTile(object, object.tile, object.onBridge);
  }

  /** 停驻判定：当前格不被目标本体占用，且父类通用停驻检查通过。 */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    return !this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target) && super.canStopAtTile(object, tile, onBridge);
  }

  /** 足够接近 = 与目标的 tile 距离在 [0, closeEnoughTiles] 内且不占用目标本体。 */
  isCloseEnoughToDest(object: any, tile: any, closeEnoughTiles: any): boolean {
    return (
      undefined === closeEnoughTiles ||
      (this.rangeHelper.isInTileRange(tile, this.target, 0, closeEnoughTiles) &&
        !this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target))
    );
  }
}
