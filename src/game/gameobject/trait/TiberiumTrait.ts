/**
 * TiberiumTrait — 泰伯利亚矿垛管理（收集/生成/移除 bail，静态可放置判定）。
 *
 * gameObject.value 编码：可采集 bail 数 = value + 1（value=-1 表示无矿）。
 * collectBail 扣 1 并在仍有矿时返回矿种；spawnBails 上限 maxBails=11；
 * removeBails 下限 -1。静态 canBePlacedOn 检查地形与占格。
 *
 * 由 game/gameobject/trait/TiberiumTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as LandTypeModule from "game/type/LandType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TiberiumTrait {
  /** 单垛最大矿堆数（含编码后 value 上界 10）。 */
  static maxBails = 11;
  /** 所属矿垛对象。 */
  gameObject: any;
  /** 矿种规则。 */
  rules: any;

  /**
   * 能否放置在该 tile：Clear/Road/Rough 地形且无地面遮挡物（污渍/单位除外）。
   * @param tile 目标格
   * @param map 地图（需 getGroundObjectsOnTile）
   */
  static canBePlacedOn(tile: any, map: any) {
    return (
      [LandTypeModule.LandType.Clear, LandTypeModule.LandType.Road, LandTypeModule.LandType.Rough].includes(tile.landType) &&
      !map.getGroundObjectsOnTile(tile).find((obj: any) => !obj.isSmudge() && !obj.isUnit())
    );
  }

  constructor(gameObject: any, rules: any) {
    this.gameObject = gameObject;
    this.rules = rules;
  }

  /** 矿种类型。 */
  getTiberiumType() {
    return this.rules.type;
  }

  /**
   * 采集一垛：value−1；仍有多于一垛时返回矿种，否则返回 undefined。
   * 无矿可采时抛错。
   */
  collectBail() {
    const count = this.getBailCount();
    if (count <= 0) throw new Error("Attempted to collect an ore bail, but there are none left");
    this.gameObject.value--;
    return count > 1 ? this.getTiberiumType() : undefined;
  }

  /** 生成 n 垛（封顶 maxBails）。 */
  spawnBails(n: number) {
    this.gameObject.value = Math.min(TiberiumTrait.maxBails, this.gameObject.value + n);
  }

  /** 移除 n 垛（下限 -1，即空垛）。 */
  removeBails(n: number) {
    this.gameObject.value = Math.max(-1, this.gameObject.value - n);
  }

  /** 当前可采 bail 数。 */
  getBailCount() {
    return this.gameObject.value + 1;
  }

  /** 释放对象引用。 */
  dispose() {
    this.gameObject = undefined;
  }
}
