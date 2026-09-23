/**
 * MinimapHandler — 小地图：tile 居中、悬停查询（考虑战争迷雾）。
 *
 * 由 gui/screen/game/worldInteraction/MinimapHandler.ts.js
 * 重写为 TS（行为完全一致）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 小地图交互处理器。 */
export class MinimapHandler {
  /** 小地图组件。 */
  minimap: any;
  /** 地图。 */
  map: any;
  /** 战争迷雾。 */
  shroud: any;
  /** 世界场景。 */
  worldScene: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;

  /**
   * @param minimap 小地图
   * @param map 地图
   * @param shroud 迷雾
   * @param worldScene 场景
   * @param mapPanningHelper 平移辅助
   */
  constructor(minimap: any, map: any, shroud: any, worldScene: any, mapPanningHelper: any) {
    this.minimap = minimap;
    this.map = map;
    this.shroud = shroud;
    this.worldScene = worldScene;
    this.mapPanningHelper = mapPanningHelper;
  }

  /**
   * 更新迷雾引用。
   * @param shroud 新迷雾
   */
  setShroud(shroud: any): void {
    this.shroud = shroud;
  }

  /**
   * 镜头跳到 tile。
   * @param tile 目标 tile
   */
  panToTile(tile: any): void {
    this.worldScene.cameraPan.setPan(this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry));
  }

  /**
   * 悬停查询：迷雾遮挡时无对象；否则返回 tile 上最靠前的 techno。
   * @param tile 悬停 tile
   */
  getHover(tile: any): { entity: any; gameObject: any; tile: any } {
    return {
      entity: void 0,
      gameObject: this.shroud?.isShrouded(tile)
        ? void 0
        : this.map
            .getObjectsOnTile(tile)
            .sort((a: any, b: any) => Number(a.isTechno()) - Number(b.isTechno()))
            .shift(),
      tile,
    };
  }
}
