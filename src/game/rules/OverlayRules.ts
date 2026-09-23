/**
 * OverlayRules — 覆盖物规则（墙/矿石/岩石/废墟等 Overlays 段键）。
 *
 * 由 game/rules/OverlayRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { LandType } from "game/type/LandType"; // 已转换
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换
import { ArmorType } from "game/type/ArmorType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class OverlayRules extends ObjectRules {
  /** 装甲类型。 */
  armor: ArmorType;
  /** 是否为箱子覆盖物。 */
  crate: boolean;
  /** 是否算岩石（影响雷达不可见缺省等）。 */
  isARock: boolean;
  /** 是否算废墟。 */
  isRubble: boolean;
  /** 是否是维恩草怪物本体。 */
  isVeinholeMonster: boolean;
  /** 是否是维恩草触须。 */
  isVeins: boolean;
  /** 地表类型。 */
  land: LandType;
  /** NoUseTileLandType 是否声明（非空串）。 */
  noUseTileLandType: boolean;
  /** 强度（生命）。 */
  strength: number;
  /** 是否为矿石。 */
  tiberium: boolean;
  /** 是否为墙。 */
  wall: boolean;
  /** 雷达上是否不可见（缺省 !wall && !isARock）。 */
  radarInvisible: boolean;

  parse(): void {
    super.parse();
    this.armor = this.ini.getEnum("Armor", ArmorType, ArmorType.None, true);
    this.crate = this.ini.getBool("Crate");
    const isARock = this.ini.getBool("IsARock");
    this.isARock = isARock;
    this.isRubble = this.ini.getBool("IsRubble");
    this.isVeinholeMonster = this.ini.getBool("IsVeinholeMonster");
    this.isVeins = this.ini.getBool("IsVeins");
    this.land = this.ini.getEnum("Land", LandType, LandType.Clear);
    this.noUseTileLandType = !!this.ini.getString("NoUseTileLandType");
    this.strength = this.ini.getNumber("Strength");
    this.tiberium = this.ini.getBool("Tiberium");
    const wall = this.ini.getBool("Wall");
    this.wall = wall;
    this.radarInvisible = this.ini.getBool("RadarInvisible", !wall && !isARock);
  }
}
