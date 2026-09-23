/**
 * GameOptRandomGen — 对局选项随机填充（颜色/国家/出生点）。
 *
 * 基于可复现的 Prng，为 randomize 流程生成三类 Map：
 *  - generateColors：在未占用颜色池中为 RANDOM_COLOR_ID 槽位抽签；
 *  - generateCountries：为 RANDOM_COUNTRY_ID 槽位抽可用多人国家下标；
 *  - generateStartLocations：打乱未占出生点，固定点前置，并把随机点
 *    尽量放到与已有固定点最远的位置（三/四人规则），最后映射到槽位；
 *    出生点不足时循环复用/回退固定位置，避免 RangeError。
 *
 * 由 game/gameopts/GameOptRandomGen.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Prng } from "game/Prng"; // 已转换
import { mpAllowedColors } from "game/rules/mpAllowedColors"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import {
  RANDOM_COLOR_ID,
  OBS_COUNTRY_ID,
  RANDOM_COUNTRY_ID,
  RANDOM_START_POS,
} from "game/gameopts/constants"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class GameOptRandomGen {
  /** 可复现随机源。 */
  prng: Prng;

  /** 用种子工厂构造：Prng.factory(seed, idx)。 */
  static factory(seed: any, idx: number): GameOptRandomGen {
    return new this(Prng.factory(seed, idx));
  }

  constructor(prng: Prng) {
    this.prng = prng;
  }

  /**
   * 为随机颜色槽位分配不冲突的颜色下标。
   * @returns 槽位对象 → 颜色下标（仅含需要随机的槽位）
   */
  generateColors(opts: any): Map<any, number> {
    const slots = [...opts.humanPlayers, ...opts.aiPlayers].filter(isNotNullOrUndefined);
    const taken = slots.map((s: any) => s.colorId).filter((id: number) => id !== RANDOM_COLOR_ID);
    const poolLen = mpAllowedColors.length;
    const available = new Array(poolLen)
      .fill(0)
      .map((_, i) => i)
      .filter((i) => !taken.includes(i));
    const result = new Map<any, number>();
    slots.forEach((slot: any) => {
      if (slot.countryId !== OBS_COUNTRY_ID && slot.colorId === RANDOM_COLOR_ID) {
        if (available.length < 1) throw new Error("Out of available colors to choose from");
        const idx = this.prng.generateRandomInt(0, available.length - 1);
        result.set(slot, available[idx]);
        available.splice(idx, 1);
      }
    });
    return result;
  }

  /**
   * 为随机国家槽位分配多人可选国家下标。
   * @param opts 对局槽位
   * @param countries 含 getMultiplayerCountries() 的国家表
   */
  generateCountries(opts: any, countries: any): Map<any, number> {
    const count = countries.getMultiplayerCountries().length;
    const slots = [...opts.humanPlayers, ...opts.aiPlayers].filter(isNotNullOrUndefined);
    const result = new Map<any, number>();
    slots.forEach((slot: any) => {
      if (slot.countryId === RANDOM_COUNTRY_ID) {
        result.set(slot, this.prng.generateRandomInt(0, count - 1));
      }
    });
    return result;
  }

  /**
   * 为随机出生点槽位分配地图出生点下标。
   *
   * 固定点保留在前缀；随机点洗牌后插入。对 ≥3 人 / ≥4 人且固定点不足的
   * 情况，用「与已放置点距离和最远」启发式补位。槽位数超过可用点时循环
   * 复用或回退到第一个固定点。
   *
   * @param opts 对局槽位
   * @param startLocations 出生点下标 → Vector2 坐标
   */
  generateStartLocations(opts: any, startLocations: Map<number, Vector2>): Map<any, number> {
    const slots = [...opts.humanPlayers, ...opts.aiPlayers].filter(isNotNullOrUndefined);
    const fixed = slots
      .filter((s: any) => s.startPos !== RANDOM_START_POS)
      .map((s: any) => s.startPos);
    const free = [...startLocations.keys()].filter((k) => !fixed.includes(k));
    const shuffled: number[] = [];
    while (free.length) {
      const idx = free.length ? this.prng.generateRandomInt(0, free.length - 1) : 0;
      shuffled.push(...free.splice(idx, 1));
    }
    // 固定点前置
    shuffled.unshift(...fixed);
    if (shuffled.length >= 3) {
      for (const slot of [1, 2]) {
        if (!(fixed.length - 1 >= slot)) {
          const coords = shuffled.map((i) => startLocations.get(i));
          const far = this.findFarthestPointFrom(coords.slice(0, slot), coords.slice(slot));
          const found = coords.findIndex((c) => c.x === far.x && c.y === far.y);
          shuffled.splice(slot, 0, ...shuffled.splice(found, 1));
        }
      }
    }
    if (shuffled.length >= 4) {
      if (fixed.length - 1 < 3) {
        const coords = shuffled.map((i) => startLocations.get(i));
        const far = this.findFarthestPointFrom(coords.slice(2, 3), coords.slice(3));
        const found = coords.findIndex((c) => c.x === far.x && c.y === far.y);
        shuffled.splice(3, 0, ...shuffled.splice(found, 1));
      }
    }
    // 去掉前置的固定点前缀，只保留供随机分配的序列
    shuffled.splice(0, fixed.length);
    const result = new Map<any, number>();
    let cursor = -1;
    slots.forEach((slot: any) => {
      if (slot.countryId !== OBS_COUNTRY_ID && slot.startPos === RANDOM_START_POS) {
        // 出生点不足时循环复用/回退固定位置，避免 RangeError 崩溃
        //（上层 SkirmishScreen 已按地图实际出生点钳制槽位，GameScreen 也有玩家数校验兜底）
        if (shuffled.length === 0) {
          result.set(slot, fixed.length > 0 ? fixed[0] : 0);
        } else {
          if (cursor >= shuffled.length - 1) cursor = -1;
          result.set(slot, shuffled[++cursor]);
        }
      }
    });
    return result;
  }

  /**
   * 在 candidates 中选出到 anchors 距离和最大的点。
   * @throws candidates 为空时抛错（与孪生一致）
   */
  findFarthestPointFrom(anchors: Vector2[], candidates: Vector2[]): Vector2 {
    const anchorVecs = anchors.map((p) => new Vector2(p.x, p.y));
    let best: Vector2;
    let bestDist = 0;
    if (!candidates.length) throw new Error("Search array must have at least one element");
    for (const c of candidates) {
      const cv = new Vector2(c.x, c.y);
      const dist = anchorVecs.reduce((acc, a) => acc + cv.distanceTo(a), 0);
      if (dist >= bestDist) {
        best = c;
        bestDist = dist;
      }
    }
    return best;
  }
}
