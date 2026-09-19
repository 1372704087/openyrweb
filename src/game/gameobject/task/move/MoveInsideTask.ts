/**
 * MoveInsideTask — 走进目标内部的任务（驻停建筑/载具内部）。
 *
 * 继承 MoveTask，专门用于"走到某个目标物体的格子上"：
 *  - 目标是建筑 → 目的地取建筑中心 tile（中心越界时取地基里第一个
 *    在图内的 tile，兜底用建筑左上角）；否则直接用目标当前 tile；
 *  - 目标本体加入 ignoredBlockers（不被自己要进的东西挡路）；
 *  - closeEnoughTiles = 0：必须精确站在目标的地基格上。
 *
 * 到达判定的关键改写：
 *  - canStopAtTile：原表达式 (!c || !r) && !(!c && !r) 等价于异或
 *    isCancelling() !== occupied —— 正常移动时只有真的站在目标占用
 *    的格子上才允许停；取消时则相反（要离开目标格子才算取消到位）；
 *  - isCloseEnoughToDest：站在目标占用的格子上即视为足够接近。
 *
 * 由 game/gameobject/task/move/MoveInsideTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveInsideTask extends MoveTask {
  /** 要走进的目标（建筑/载具等）。 */
  target: any;

  /** 目的地 tile：建筑取中心（越界回退到地基内首个合法格），其它取所在 tile。 */
  static chooseTargetFoundationTile(target: any, game: any): any {
    if (target.isBuilding()) {
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

  constructor(game: any, target: any) {
    super(game, MoveInsideTask.chooseTargetFoundationTile(target, game), false, {
      ignoredBlockers: [target],
      closeEnoughTiles: 0,
    });
    this.target = target;
  }

  /** 路径走完，或已能停在目标格子上，都算到达。 */
  hasReachedDestination(object: any): boolean {
    return super.hasReachedDestination(object) || this.canStopAtTile(object, object.tile, object.onBridge);
  }

  /**
   * 停驻判定（覆盖父类）：occupied = 该格是否被目标占用。
   * 逐字保留孪生表达式（不要化简成异或——isCancelling() 非严格布尔时
   * 行为不同，parity 探针实测过）。布尔语义：取消时须已离开目标格，
   * 正常进入时须站在目标格上。
   */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    const occupied = this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target);
    return (!this.isCancelling() || !occupied) && !(!this.isCancelling() && !occupied);
  }

  /** 足够接近 = 当前格被目标占用（站在目标身上/内部）。 */
  isCloseEnoughToDest(object: any, tile: any, closeEnoughTiles: any): boolean {
    return this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target);
  }
}
