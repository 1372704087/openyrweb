/**
 * mapObjects — 地图放置对象（Structure/Vehicle/Infantry/…）类型层次。
 *
 * MapObject 持有 ObjectType；结构/车辆/步兵共享 Techno 祖先（带
 * health），Terrain/Smudge 共享中间祖先，Overlay 直接继承 MapObject。
 * isNamed/isTechno 用 in 运行时探测（与孪生一致）。
 *
 * 由 data/mapObjects.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图对象基类：按 ObjectType 区分种类。 */
export class MapObject {
  /** 对象种类。 */
  type: ObjectType;
  /**
   * 解析器动态挂载字段（owner/name/health/rx/…）。
   * 孪生在运行时直接赋值；用索引签名对齐，保证 isNamed/isTechno 的 in 探测有类型落点。
   */
  [key: string]: any;

  constructor(type: ObjectType) {
    this.type = type;
  }

  /** 是否建筑。 */
  isStructure(): boolean {
    return this.type === ObjectType.Building;
  }

  /** 是否载具。 */
  isVehicle(): boolean {
    return this.type === ObjectType.Vehicle;
  }

  /** 是否步兵。 */
  isInfantry(): boolean {
    return this.type === ObjectType.Infantry;
  }

  /** 是否飞行器。 */
  isAircraft(): boolean {
    return this.type === ObjectType.Aircraft;
  }

  /** 是否地形。 */
  isTerrain(): boolean {
    return this.type === ObjectType.Terrain;
  }

  /** 是否污渍。 */
  isSmudge(): boolean {
    return this.type === ObjectType.Smudge;
  }

  /** 是否覆盖物。 */
  isOverlay(): boolean {
    return this.type === ObjectType.Overlay;
  }

  /** 是否带 name 字段（运行时 in 探测）。 */
  isNamed(): boolean {
    return "name" in this;
  }

  /** 是否带 health 字段（Techno）。 */
  isTechno(): boolean {
    return "health" in this;
  }
}

/** 中间层：Terrain / Smudge 祖先（无额外字段，仅占位以对齐继承树）。 */
export class TerrainAndSmudgeBase extends MapObject {}

/** Techno 祖先：结构 / 载具 / 步兵 / 飞行器（health 等由子类/解析器挂载）。 */
export class TechnoBase extends TerrainAndSmudgeBase {}

/** 建筑对象。 */
export class Structure extends TechnoBase {
  constructor() {
    super(ObjectType.Building);
  }
}

/** 载具对象。 */
export class Vehicle extends TechnoBase {
  constructor() {
    super(ObjectType.Vehicle);
  }
}

/** 步兵对象。 */
export class Infantry extends TechnoBase {
  constructor() {
    super(ObjectType.Infantry);
  }
}

/** 飞行器对象。 */
export class Aircraft extends TechnoBase {
  constructor() {
    super(ObjectType.Aircraft);
  }
}

/** 地形对象。 */
export class Terrain extends TerrainAndSmudgeBase {
  constructor() {
    super(ObjectType.Terrain);
  }
}

/** 污渍对象。 */
export class Smudge extends TerrainAndSmudgeBase {
  constructor() {
    super(ObjectType.Smudge);
  }
}

/** 覆盖物对象。 */
export class Overlay extends MapObject {
  constructor() {
    super(ObjectType.Overlay);
  }
}
