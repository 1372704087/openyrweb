/**
 * MinimapModel — 小地图 tile 颜色模型（遮蔽/伪装/墙/矿/地形雷达色）。
 *
 * updateColors 扫描占用对象选主色写入 tileColors；getTileColor 结合 shroud
 * 与 Darken 旗标输出 #rrggbb。
 *
 * 由 engine/renderable/entity/map/MinimapModel.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ShroudType, ShroudFlag } from "game/map/MapShroud"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地形默认雷达色 rgb(173,170,132)。 */
const terrainColor: any = new (THREE as any).Color("rgb(173, 170, 132)");
/** 特殊墙覆盖色表。 */
const wallColors: Map<string, any> = new Map<string, any>([
  ["CAKRMW", new (THREE as any).Color("rgb(107, 69, 49)")],
  ["CAFNCW", new (THREE as any).Color(16777215)],
  ["CAFNCB", new (THREE as any).Color(0)],
  ["GASAND", new (THREE as any).Color("rgb(82, 77, 57)")],
]);
/** 非墙/非矿覆盖默认色。 */
const coverColor: any = new (THREE as any).Color("rgb(90, 89, 82)");
/** 砖石/废墟黑。 */
const rubbleColor: any = new (THREE as any).Color(0);
/** 泰伯利亚/矿色。 */
const tiberiumColor: any = new (THREE as any).Color("rgb(173, 170, 132)");
/** 其它覆盖黑。 */
const blackColor: any = new (THREE as any).Color(0);

/** 小地图颜色模型。 */
export class MinimapModel {
  /** tile 集合。 */
  tiles: any;
  /** 占用查询。 */
  tileOccupation: any;
  /** 战争迷雾。 */
  shroud?: any;
  /** 本地玩家 Ref。 */
  localPlayer?: any;
  /** 联盟/共享情报。 */
  alliances?: any;
  /** 空降规则（paradropPlane 名）。 */
  paradropRules: any;
  /** 行宽。 */
  stride: number;
  /** tile 下标 → hex。 */
  tileColors: Uint32Array;
  /** 空降机等穿雾标记。 */
  aboveShroudTiles: Uint8Array;
  /** 有 techno 标记（Darken 不降亮度）。 */
  tileWithTechnos: Uint8Array;

  /**
   * @param tiles - 需 getMapSize/getAll/getTileRadarColor
   * @param tileOccupation - getObjectsOnTile
   * @param shroud - 可选
   * @param localPlayer - 可选 Ref
   * @param alliances - haveSharedIntel
   * @param paradropRules - { paradropPlane }
   */
  constructor(tiles: any, tileOccupation: any, shroud: any, localPlayer: any, alliances: any, paradropRules: any) {
    this.tiles = tiles;
    this.tileOccupation = tileOccupation;
    this.shroud = shroud;
    this.localPlayer = localPlayer;
    this.alliances = alliances;
    this.paradropRules = paradropRules;
    const size = this.tiles.getMapSize();
    this.stride = size.width;
    this.tileColors = new Uint32Array(size.width * size.height);
    this.aboveShroudTiles = new Uint8Array(size.width * size.height);
    this.tileWithTechnos = new Uint8Array(size.width * size.height);
  }

  /** 全图重算颜色。 */
  computeAllColors(): void {
    this.updateColors(this.tiles.getAll());
  }

  /**
   * 更新给定 tile 列表的颜色与标记。
   * @param list - tile 列表
   */
  updateColors(list: Iterable<any>): void {
    for (const tile of list) {
      let score = -1;
      let chosen: any;
      for (const obj of this.tileOccupation.getObjectsOnTile(tile)) {
        const eligible =
          ((obj.isTechno() || obj.isOverlay() || obj.isTerrain()) && !obj.radarInvisible) ||
          (obj.isOverlay() && obj.isBridge()) ||
          (obj.isBuilding() &&
            !obj.rules.invisibleInGame &&
            (!obj.radarInvisible || (obj.rules.canBeOccupied && obj.owner.isCombatant())));
        if (!eligible) continue;
        const s =
          4 * Number(obj.isTechno()) + 2 * Number(obj.isAircraft()) + Number(obj.name !== this.paradropRules.paradropPlane);
        if (s > score) {
          score = s;
          chosen = obj;
        }
      }
      let color: any;
      if (chosen) {
        if ((chosen.isTechno() || chosen.isOverlay()) && chosen.rules.wall) {
          color = wallColors.get(chosen.name) ?? coverColor;
        } else if (chosen.isBuilding() && chosen.isDestroyed && chosen.rules.leaveRubble) {
          color = rubbleColor;
        } else if (chosen.isTechno()) {
          if (
            chosen.cloakableTrait?.isCloaked() &&
            this.localPlayer &&
            !this.alliances!.haveSharedIntel(this.localPlayer, chosen.owner)
          ) {
            color = void 0;
          } else {
            const disguise = (chosen.isInfantry() || chosen.isVehicle()) && chosen.disguiseTrait?.getDisguise();
            color =
              this.localPlayer &&
              disguise &&
              !this.alliances!.haveSharedIntel(this.localPlayer, chosen.owner) &&
              !this.localPlayer.sharedDetectDisguiseTrait?.has(chosen)
                ? disguise.owner
                  ? new (THREE as any).Color(disguise.owner.color.asHex())
                  : terrainColor
                : new (THREE as any).Color(chosen.owner.color.asHex());
          }
        } else if (chosen.isTerrain()) {
          color = terrainColor;
        } else {
          if (!chosen.isOverlay()) return;
          color = chosen.isTiberium() ? tiberiumColor : blackColor;
        }
      }
      color = color || this.tiles.getTileRadarColor(tile);
      const idx = tile.rx + tile.ry * this.stride;
      this.tileColors[idx] = color.getHex();
      this.aboveShroudTiles[idx] = chosen?.name === this.paradropRules.paradropPlane ? 1 : 0;
      this.tileWithTechnos[idx] = chosen?.isTechno() ? 1 : 0;
    }
  }

  /**
   * 取 tile 显示色（含遮蔽与 Darken）。
   * @param tile - 含 rx/ry
   */
  getTileColor(tile: any): string {
    const idx = tile.rx + tile.ry * this.stride;
    if (this.shroud?.getShroudType(tile) === ShroudType.Unexplored && !this.aboveShroudTiles[idx]) {
      return "#000000";
    }
    const color = new (THREE as any).Color(this.tileColors[idx]);
    if (this.shroud?.isFlagged(tile, ShroudFlag.Darken) && !this.tileWithTechnos[idx]) {
      color.multiplyScalar(0.35);
    }
    return "#" + color.getHexString();
  }
}
