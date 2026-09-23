/**
 * TerrainRules — 地形对象规则（动画、免疫、占据子格位等）。
 *
 * OccupationBits 用 3 个 bit 表示右/左/下三个方向的子格占据；All=7 表示
 * 全占。testOccupationBit(subCell, bits) 判定某个 subCell 是否落在给定位
 * 集合内（0/1 恒占，2–4 查对应 bit）。
 *
 * 由 game/rules/TerrainRules.ts.js 重写为 TS（行为完全一致，枚举值脚本
 * 提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换
import { TheaterType } from "engine/TheaterType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地形占据子格位掩码。 */
export enum OccupationBits {
  /** 全部方向占据。 */
  All = 7,
  /** 右。 */
  Right = 1,
  /** 左。 */
  Left = 2,
  /** 下。 */
  Bottom = 4,
}

/**
 * 判断某 subCell 是否被 bits 覆盖。
 * @param subCell 0–4；0/1 恒为 true；2/3/4 分别对应 Right/Left/Bottom
 * @param bits 占据位掩码
 * @throws subCell 不在 0–4 时抛错（与孪生一致）
 */
export function testOccupationBit(subCell: number, bits: number): boolean {
  switch (subCell) {
    case 0:
    case 1:
      return true;
    case 2:
      return 0 != (bits & OccupationBits.Right);
    case 3:
      return 0 != (bits & OccupationBits.Left);
    case 4:
      return 0 != (bits & OccupationBits.Bottom);
    default:
      throw new Error('Invalid subCell "' + subCell);
  }
}

export class TerrainRules extends ObjectRules {
  /** 动画速率。 */
  animationRate: number;
  /** 动画触发概率。 */
  animationProbability: number;
  /** 是否为闸门类。 */
  gate: boolean;
  /** 是否免疫（伤害等）。 */
  immune: boolean;
  /** 是否带动画。 */
  isAnimated: boolean;
  /** 雪地 theater 占据位。 */
  snowOccupationBits: number;
  /** 是否种植矿石（SpawnsTiberium）。 */
  spawnsTiberium: boolean;
  /** 强度（生命）。 */
  strength: number;
  /** 雷达不可见。 */
  radarInvisible: boolean;
  /** 温带 theater 占据位。 */
  temperateOccupationBits: number;

  parse(): void {
    super.parse();
    this.animationRate = this.ini.getNumber("AnimationRate");
    this.animationProbability = this.ini.getNumber("AnimationProbability");
    this.gate = this.ini.getBool("Gate");
    this.immune = this.ini.getBool("Immune");
    this.isAnimated = this.ini.getBool("IsAnimated");
    this.snowOccupationBits = this.normalizeOccupationBits(
      this.ini.getNumber("SnowOccupationBits", OccupationBits.All),
    );
    this.spawnsTiberium = this.ini.getBool("SpawnsTiberium");
    this.strength = this.ini.getNumber("Strength");
    this.radarInvisible = this.ini.getBool("RadarInvisible");
    this.temperateOccupationBits = this.normalizeOccupationBits(
      this.ini.getNumber("TemperateOccupationBits", OccupationBits.All),
    );
  }

  /** 把超出 0–7 的占据位规范到 [0,7]（保持低 3 位语义）。 */
  normalizeOccupationBits(bits: number): number {
    return (bits + 8 * Math.abs(Math.floor(bits / 8))) % 8;
  }

  /** 按 theater 取对应占据位（Snow 用雪地，其它用温带）。 */
  getOccupationBits(theater: TheaterType): number {
    return theater !== TheaterType.Snow ? this.temperateOccupationBits : this.snowOccupationBits;
  }

  /** 按 theater 列出被占据的 subCell 列表（0–4）。 */
  getOccupiedSubCells(theater: TheaterType): number[] {
    const bits = this.getOccupationBits(theater);
    const all = [0, 1, 2, 3, 4];
    if (bits === OccupationBits.All) return all;
    const out: number[] = [];
    for (const cell of all) {
      if (testOccupationBit(cell, bits)) out.push(cell);
    }
    return out;
  }
}
