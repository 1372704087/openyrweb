/**
 * DebugUtils — 调试线框盒与棋盘格纹理生成。
 *
 * 由 engine/gfx/DebugUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { IndexedBitmap } from "data/Bitmap"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 瓦片区域尺寸。 */
export interface TileSizeLike {
  width: number;
  height: number;
}

/** DebugUtils 静态工具。 */
export class DebugUtils {
  /** 生成瓦片尺寸线框 Mesh（wireframe basic 材质）。 */
  static createWireframe(tileSize: TileSizeLike, tileHeight: number): any {
    return new THREE.Mesh(
      this.createBoxGeometry(tileSize, tileHeight),
      new THREE.MeshBasicMaterial({ wireframe: true }),
    );
  }

  /**
   * 瓦片矩形 → BoxBufferGeometry。
   * @param center 为 true 时把盒子原点移到底面中心（y 上半高），否则角点在 (0,0,0) 向 + 伸展。
   */
  static createBoxGeometry(tileSize: TileSizeLike, tileHeight: number, center: boolean = false): any {
    const worldTile = Coords.getWorldTileSize();
    const w = tileSize.width * worldTile;
    const h = Coords.tileHeightToWorld(tileHeight);
    const d = tileSize.height * worldTile;
    const geometry = new THREE.BoxBufferGeometry(w, h, d);
    if (center) geometry.translate(0, h / 2, 0);
    else geometry.translate(w / 2, h / 2, d / 2);
    return geometry;
  }

  /** 64×64 棋盘 DataTexture（对角 32×32 块着色，NearestFilter，AlphaFormat）。 */
  static createIndexedCheckerTex(baseColor: number, altColor: number): any {
    const bitmap = new IndexedBitmap(64, 64, new Uint8Array(4096).fill(baseColor));
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        bitmap.data[x + 64 * y] = altColor;
        bitmap.data[x + 32 + 64 * (y + 32)] = altColor;
      }
    }
    const texture = new THREE.DataTexture(bitmap.data, 64, 64, THREE.AlphaFormat);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }
}
