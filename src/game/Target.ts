/**
 * Target — 攻击/命令目标的统一包装（对象 / 地块 / 桥 / 矿）。
 *
 * 构造时按源对象形态分流：
 *  - 桥 overlay（isOverlay && isBridge）→ 记 bridge + 指定 tile；
 *  - 矿 overlay（isOverlay && isTiberium）→ isOre=true，tile 取矿格；
 *  - 普通对象 → obj，并取建筑 centerTile 或对象 tile；
 *  - 无对象、仅有 tile → 若 tile 是矿格则 isOre=true，tile=该格。
 * equals 比较四元组 (obj, tile, bridge, isOre)；getWorldCoords 优先取
 * 对象世界坐标，否则由 tile 中心 + 桥高换算。isBridge/getBridge 处理
 * 无对象时的桥查询与「单位在桥上」回退。
 *
 * 由 game/Target.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Target {
  /** 占位对象（建筑/单位/地形等），无则 undefined。 */
  obj?: any;
  /** 目标所在地块（桥/矿/对象 tile 均可能）。 */
  tile?: any;
  /** 桥 overlay（仅当源是桥时直接记录）。 */
  bridge?: any;
  /** 是否为矿目标（矿 overlay 或 tile 地表为 Tiberium）。 */
  isOre: any = false;
  /** 地块占用查询（getBridge 回退时使用）。 */
  tileOccupation: any;

  constructor(obj: any, tile: any, tileOccupation: any) {
    this.tileOccupation = tileOccupation;
    this.isOre = false;
    if (obj) {
      if (obj.isOverlay() && obj.isBridge()) {
        this.bridge = obj;
        this.tile = tile;
      } else if (obj.isOverlay() && obj.isTiberium()) {
        this.isOre = true;
        this.tile = obj.tile;
      } else {
        this.obj = obj;
        this.tile = obj.isBuilding() ? obj.centerTile : obj.tile;
      }
    } else {
      if (tile.landType === LandType.Tiberium) this.isOre = true;
      this.tile = tile;
    }
  }

  /** 结构相等：obj/tile/bridge/isOre 四字段全等。 */
  equals(other: any): boolean {
    return this.obj === other.obj && this.tile === other.tile && this.bridge === other.bridge && this.isOre === other.isOre;
  }

  /** 世界坐标：有对象取 position.worldPosition，否则 tile 中心（+桥高）。 */
  getWorldCoords(): any {
    if (this.obj) return this.obj.position.worldPosition;
    return Coords.tile3dToWorld(
      this.tile.rx + 0.5,
      this.tile.ry + 0.5,
      this.tile.z + (this.bridge?.tileElevation ?? 0),
    );
  }

  /** 是否为「无对象、但带桥」的纯桥目标。 */
  isBridge(): boolean {
    return !this.obj && !!this.bridge;
  }

  /**
   * 取桥：优先 bridge 字段；若无则当对象是「在桥上的单位」时，从
   * tileOccupation 按其所在格回查桥对象，否则 undefined。
   */
  getBridge(): any {
    return (
      this.bridge ||
      (this.obj?.isUnit() && this.obj.onBridge ? this.tileOccupation.getBridgeOnTile(this.obj.tile) : void 0)
    );
  }
}
