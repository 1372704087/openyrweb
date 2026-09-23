/**
 * MapSpriteTranslation — 地图精灵锚点换算（tile 世界 → 屏幕偏移 / 世界锚点）。
 *
 * 由 engine/renderable/MapSpriteTranslation.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CoordsModule from "game/Coords"; // 孪生
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生

const Coords = (CoordsModule as any).Coords as any;
const IsoCoords = (IsoCoordsModule as any).IsoCoords as any;

declare const THREE: any;

/** compute() 返回结构。 */
export interface MapSpriteTranslationResult {
  /** 精灵相对锚点的屏幕偏移。 */
  spriteOffset: any;
  /** 世界空间锚点。 */
  anchorPointWorld: any;
}

/**
 * 把 tile 坐标 (rx, ry) 转成精灵屏幕偏移与世界锚点。
 * 若 anchor 屏幕 y 存在亚像素分量，则回推对齐到整数像素后的世界点。
 */
export class MapSpriteTranslation {
  /**
   * @param rx - tile x（列）
   * @param ry - tile y（行）
   */
  constructor(
    public rx: number,
    public ry: number,
  ) {}

  /**
   * 计算精灵偏移与世界锚点。
   * @returns { spriteOffset, anchorPointWorld }
   */
  compute(): MapSpriteTranslationResult {
    let e = Coords.tileToWorld(this.rx, this.ry);
    let t = IsoCoords.worldToScreen(e.x, e.y);
    const i = IsoCoords.worldToScreen(0, 0);
    const r = new THREE.Vector2(i.x - t.x, i.y - t.y);
    const frac = r.y - Math.floor(r.y);
    if (frac != 0) {
      r.y -= frac;
      const alignedScreen = new THREE.Vector2(i.x - r.x, i.y - r.y);
      e = IsoCoords.screenToWorld(alignedScreen.x, alignedScreen.y);
    }
    return { spriteOffset: r, anchorPointWorld: e };
  }
}
