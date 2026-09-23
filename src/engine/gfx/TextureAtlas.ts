/**
 * TextureAtlas — 多图 GrowingPacker 装箱 → 单张 DataTexture（Alpha + Nearest）。
 * onUpdate 时可从 imageRects 重建 data（dispose 后返回零缓冲）。
 *
 * 由 engine/gfx/TextureAtlas.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { IndexedBitmap } from "data/Bitmap"; // 已转换

declare const THREE: any;
/** 全局 GrowingPacker（window 挂载，由 Application 注入）。 */
declare const GrowingPacker: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 可打包的索引图最小形状。 */
export interface AtlasImageLike {
  width: number;
  height: number;
}

/** 装箱条目。 */
interface PackItem {
  w: number;
  h: number;
  image: AtlasImageLike;
  fit?: { x: number; y: number };
}

/** 图在 atlas 中的矩形。 */
export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** texture dispose 事件 → 标记 isDisposed 供 onUpdate data getter 分支。 */
function onTextureDispose(ev: any): void {
  const texture = ev.target;
  texture.isDisposed = true;
  texture.removeEventListener("dispose", onTextureDispose);
}

/** 按 fit 装箱结果画入 IndexedBitmap，并可选记录 rects。 */
function paintRects(items: PackItem[], width: number, height: number, rects?: Map<AtlasImageLike, ImageRect>): IndexedBitmap {
  const bitmap = new IndexedBitmap(width, height);
  items.forEach((item) => {
    if (!item.fit) throw new Error("Couldn't fit all images in a single texture");
    const image = item.image;
    const x = item.fit.x;
    const y = item.fit.y;
    if (rects) rects.set(image, { x, y, width: item.w, height: item.h });
    bitmap.drawIndexedImage(image as any, x, y);
  });
  return bitmap;
}

/** TextureAtlas。 */
export class TextureAtlas {
  width?: number;
  height?: number;
  imageRects?: Map<AtlasImageLike, ImageRect>;
  texture?: any;

  getTexture(): any {
    if (!this.texture) throw new Error("Texture atlas not initialized");
    return this.texture;
  }

  getImageRect(image: AtlasImageLike): ImageRect {
    if (!this.imageRects) throw new Error("Texture atlas not initialized");
    const rect = this.imageRects.get(image);
    if (!rect) throw new Error("Image not found in atlas");
    return rect;
  }

  /** 装箱 + 建 DataTexture；宽高偶化、按面积降序（1e4*w + h）排序。 */
  pack(images: Iterable<AtlasImageLike>): void {
    const items: PackItem[] = [];
    for (const image of images) {
      items.push({
        w: image.width + (image.width % 2),
        h: image.height + (image.height % 2),
        image,
      });
    }
    items.sort((a, b) => 1e4 * (b.w - a.w) + b.h - a.h);

    const packer = new GrowingPacker();
    packer.fit(items);
    const atlasW = packer.root.w;
    const atlasH = packer.root.h;
    const rects = new Map<AtlasImageLike, ImageRect>();
    const bitmap = paintRects(items, atlasW, atlasH, rects);

    const texture = new THREE.DataTexture(bitmap.data, atlasW, atlasH, THREE.AlphaFormat);
    texture.needsUpdate = true;
    texture.flipY = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.onUpdate = (/* this texture */) => {
      const tex = texture;
      tex.image = {
        width: tex.image.width,
        height: tex.image.height,
        get data() {
          if (tex.isDisposed) return new Uint8Array(this.width * this.height);
          console.log("TextureAtlas: Rebuilding texture for upload to GPU...");
          return paintRects(items, atlasW, atlasH).data;
        },
      };
      tex.addEventListener("dispose", onTextureDispose);
    };

    this.width = atlasW;
    this.height = atlasH;
    this.imageRects = rects;
    this.texture = texture;
  }

  dispose(): void {
    this.texture?.dispose();
  }
}
