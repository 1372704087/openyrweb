/**
 * CenterBaseCmd — 镜头居中到主基地（主厂建筑或基地车）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 孪生
import * as TechnoRulesModule from "game/rules/TechnoRules"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const ObjectType: any = (ObjectTypeModule as any).ObjectType;
const FactoryType: any = (TechnoRulesModule as any).FactoryType;

/** 主基地居中命令。 */
export class CenterBaseCmd {
  /** 当前玩家。 */
  player: any;
  /** 全局规则。 */
  rules: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;

  /**
   * @param player 玩家
   * @param rules 规则
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   */
  constructor(player: any, rules: any, mapPanningHelper: any, cameraPan: any) {
    this.player = player;
    this.rules = rules;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
  }

  /** 居中：优先主厂 centerTile，否则找 baseUnit 名匹配的载具 tile。 */
  execute(): void {
    let tile: any;
    const factory = this.player.production.getPrimaryFactory(FactoryType.BuildingType);
    if (factory) {
      tile = factory.centerTile;
    } else {
      const unit = this.player
        .getOwnedObjectsByType(ObjectType.Vehicle)
        .find((u: any) => this.rules.general.baseUnit.includes(u.name));
      if (unit) tile = unit.tile;
    }
    if (tile) {
      this.cameraPan.setPan(this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry));
    }
  }
}
