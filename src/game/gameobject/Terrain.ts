/**
 * Terrain — 地形物（树、岩石等地图静态点缀物）。
 *
 * 不参与战斗与寻路，仅提供外观与部分规则开关（如雷达隐形）。
 * 由地图加载时批量创建。
 *
 * 由 game/gameobject/Terrain.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import { GameObject } from "game/gameobject/GameObject";

export class Terrain extends GameObject {
  /** 是否对雷达小地图不可见（rules.RadarInvisible）。 */
  radarInvisible: boolean;

  static factory(name: string, rules: any, art: any): Terrain {
    return new this(name, rules, art);
  }

  constructor(name: string, rules: any, art: any) {
    super(ObjectType.Terrain, name, rules, art);
    this.radarInvisible = this.rules.radarInvisible;
  }
}
