/**
 * Smudge — 地面污渍/灼痕（弹坑、脚印、涂鸦等贴地图层）。
 *
 * 纯视觉对象，占位大小取自规则（决定它遮盖多大范围的地面）。
 *
 * 由 game/gameobject/Smudge.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import { GameObject } from "game/gameobject/GameObject";

export class Smudge extends GameObject {
  static factory(name: string, rules: any, art: any): Smudge {
    return new this(name, rules, art);
  }

  constructor(name: string, rules: any, art: any) {
    super(ObjectType.Smudge, name, rules, art);
  }

  /** 污渍覆盖的占位尺寸（tile 数），来自 INI 规则。 */
  getFoundation(): { width: number; height: number } {
    return { width: this.rules.width, height: this.rules.height };
  }
}
