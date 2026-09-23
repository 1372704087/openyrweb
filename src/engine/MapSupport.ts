/**
 * MapSupport — 地图兼容性检查（INI 版本、战区、tile/overlay/武器/单位引用）。
 *
 * 由 engine/MapSupport.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Rules } from "game/rules/Rules"; // 已转换
import { Engine } from "engine/Engine"; // 已转换
import * as TileSetsModule from "game/theater/TileSets"; // 孪生
import { TheaterType } from "engine/TheaterType"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换

const TileSets = (TileSetsModule as any).TileSets as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图摘要：兼容性检查所需字段。 */
export interface MapSupportInfo {
  iniFormat: number;
  startingLocations: unknown[];
  theaterType: TheaterType;
  maxTileNum: number;
  maxOverlayId: number;
}

/** 本地化文案取值对象（get(key, ...args) → string）。 */
export type L10nGet = {
  get(key: string, ...args: any[]): string;
};

/**
 * 地图兼容性检查器（仅静态方法）。
 * 任一依赖缺失时返回对应本地化错误文案；全部通过时返回 undefined。
 */
export class MapSupport {
  /**
   * 检查地图是否受当前引擎支持。
   * @param e - 地图信息
   * @param i - 文案取值函数
   * @returns 不支持时的错误文案；支持时为 undefined（与孪生无 return 一致）
   */
  static check(e: MapSupportInfo, i: L10nGet): string | undefined {
    if (e.iniFormat < 4) {
      return i.get("TS:MapUnsupportedGame");
    }
    if (e.startingLocations.length < 2) {
      return i.get("TXT_SCENARIO_TOO_SMALL", e.startingLocations.length);
    }
    if (!Engine.supportsTheater(e.theaterType)) {
      return i.get("TS:MapUnsupportedTheater", TheaterType[e.theaterType]);
    }
    let r: any;
    let t: any;
    let s: any;
    let a: any;
    let n: any;
    let o: any;
    let l: any;
    const c = Engine.getTheaterIni(Engine.getActiveEngine(), e.theaterType);
    const h = new TileSets(c);
    if (e.maxTileNum > h.readMaxTileNum()) {
      return i.get("TS:MapUnsupportedTileSet");
    }
    const u = new Rules(Engine.getRules().clone().mergeWith(e));
    if (!u.hasOverlayId(e.maxOverlayId)) {
      return i.get("TS:MapUnsupportedOverlay", e.maxOverlayId);
    }
    const d = u
      .getIni()
      .getOrderedSections()
      .map((e: any) => e.name.toLowerCase());
    for (r of u.weaponTypes.values()) {
      if (!u.getIni().getSection(r)) {
        return i.get("TS:MapUnsupportedWeapon", r);
      }
      const g = u.getWeapon(r);
      const e2 = g.projectile;
      const t2 = g.warhead;
      if (!e2 || !t2) {
        return i.get("TS:MapUnsupportedWeapon", r);
      }
      if (!d.includes(e2.toLowerCase())) {
        return i.get("TS:MapUnsupportedProjectile", e2);
      }
      if (!d.includes(t2.toLowerCase())) {
        return i.get("TS:MapUnsupportedWarhead", t2);
      }
    }
    for (t of [...u.general.baseUnit, ...u.general.harvesterUnit]) {
      if (t && !u.hasObject(t, ObjectType.Vehicle)) {
        return i.get("TS:MapUnsupportedTechno", t);
      }
    }
    for (s of u.general.defaultMirageDisguises) {
      if (s && !u.terrainRules.has(s)) {
        return i.get("TS:MapUnsupportedTerrain", s);
      }
    }
    for (a of [
      u.general.engineer,
      u.general.crew.alliedCrew,
      u.general.crew.sovietCrew,
      u.general.alliedDisguise,
      u.general.sovietDisguise,
    ]) {
      if (a && !u.infantryRules.has(a)) {
        return i.get("TS:MapUnsupportedTechno", a);
      }
    }
    for (n of [u.crateRules.crateImg, u.crateRules.waterCrateImg]) {
      if (n && !u.overlayRules.has(n)) {
        return i.get("TS:MapUnsupportedOverlay", n);
      }
    }
    for (o of u.buildingRules.values()) {
      if (o.undeploysInto && !u.hasObject(o.undeploysInto, ObjectType.Vehicle)) {
        return i.get("TS:MapUnsupportedTechno", o.undeploysInto);
      }
    }
    for (l of [
      ...u.infantryRules.values(),
      ...u.vehicleRules.values(),
      ...u.aircraftRules.values(),
    ]) {
      if (l.spawns && !u.hasObject(l.spawns, ObjectType.Aircraft)) {
        return i.get("TS:MapUnsupportedTechno", l.spawns);
      }
      if (l.deploysInto && !u.hasObject(l.deploysInto, ObjectType.Building)) {
        return i.get("TS:MapUnsupportedTechno", l.deploysInto);
      }
    }
    return undefined;
  }
}
