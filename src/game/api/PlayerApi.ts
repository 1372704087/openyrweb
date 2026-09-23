/**
 * PlayerApi — 单个玩家的便捷门面（名字 + 子 API 持有）。
 *
 * 构造 (name, gameApi, actions, production)：getPlayerData / isDefeated /
 * isAlliedWith / canPlaceBuilding / getVisibleUnits 均以 this.name 为
 * 玩家名委托 gameApi；actions / production 为公开子门面。
 *
 * 由 game/api/PlayerApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlayerApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 玩家名（孪生公开赋值顺序：name → actions → production）。 */
  name: any;
  /** 动作门面。 */
  actions: any;
  /** 生产门面。 */
  production: any;
  /** 所属 GameApi（孪生为 WeakMap 私有，第三赋值前插入）。 */
  private gameApi: any;

  constructor(name: any, gameApi: any, actions: any, production: any) {
    this.name = name;
    this.actions = actions;
    this.production = production;
    this.gameApi = gameApi;
  }

  getPlayerData(): any {
    return this.gameApi.getPlayerData(this.name);
  }

  isDefeated(): any {
    return this.gameApi.isPlayerDefeated(this.name);
  }

  isAlliedWith(otherName: any): any {
    return this.gameApi.areAlliedPlayers(this.name, otherName);
  }

  canPlaceBuilding(buildingName: any, tile: any): any {
    return this.gameApi.canPlaceBuilding(this.name, buildingName, tile);
  }

  getVisibleUnits(relation: any, filter?: any): any {
    return this.gameApi.getVisibleUnits(
      this.name,
      relation,
      filter !== undefined ? filter : () => true,
    );
  }
}
