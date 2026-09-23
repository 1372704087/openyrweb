/**
 * TextureUtils — 调色板 → THREE.Texture 缓存构造。
 *
 * 由 engine/gfx/TextureUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { RgbaBitmap } from "data/Bitmap"; // 已转换
import { fnv32a } from "util/math"; // 已转换
import { CanvasUtils } from "engine/gfx/CanvasUtils"; // 孪生（本批内一并转换）
import { PalDrawable } from "engine/gfx/drawable/PalDrawable"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 调色板最小形状。 */
export interface PaletteLike {
  hash: number | string;
  size: number;
  getColor(index: number): { r: number; g: number; b: number };
}

/** TextureUtils 静态工具 + 按 hash 的纹理缓存。 */
export class TextureUtils {
  /** key：单 palette 的 hash，或多 palette 的 fnv32a(hash 序列)。 */
  static cache: Map<number | string, any> = new Map();

  /** 单张调色板条带纹理（带缓存）。 */
  static textureFromPalette(palette: PaletteLike): any {
    const key = palette.hash;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const palBitmap = new PalDrawable(palette).draw();
    const texture = this.textureFromPalBitmap(palBitmap);
    this.cache.set(key, texture);
    return texture;
  }

  /** 多张调色板纵向拼条带纹理（带缓存）；空数组抛错。 */
  static textureFromPalettes(palettes: PaletteLike[]): any {
    if (!palettes.length) throw new Error("At least one palette is required");
    const key = fnv32a(palettes.map((p) => p.hash as any));
    const cached = this.cache.get(key);
    if (cached) return cached;
    let out: RgbaBitmap;
    const strips = palettes.map((p) => new PalDrawable(p).draw());
    out = new RgbaBitmap(strips[0].width, strips.length);
    let y = 0;
    for (const strip of strips) out.drawRgbaImage(strip, 0, y++);
    const texture = this.textureFromPalBitmap(out);
    this.cache.set(key, texture);
    return texture;
  }

  /** RgbaBitmap → Nearest/不翻转 THREE.Texture。 */
  static textureFromPalBitmap(bitmap: RgbaBitmap): any {
    const canvas = CanvasUtils.canvasFromRgbaImageData(bitmap.data, bitmap.width, bitmap.height);
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  }
}
