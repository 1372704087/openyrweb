/**
 * CanvasTextureAtlas — Canvas 2D 精灵图集打包（GrowingPacker + Nearest 纹理）。
 *
 * 由 engine/renderable/builder/CanvasTextureAtlas.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

declare const THREE: any;
/** 全局 GrowingPacker（window 挂载，由 Application 注入）。 */
declare const GrowingPacker: any;

/** 图集内图像矩形。 */
export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 可打包的 HTMLImageElement / Canvas 最小形状。 */
export type PackableImage = any;

/**
 * Canvas 纹理图集。
 * pack() 按宽高降序装箱到单张 canvas，产出 THREE.Texture 与 image→rect 映射。
 */
export class CanvasTextureAtlas {
  private texture?: any;
  private imageRects?: Map<PackableImage, ImageRect>;

  /** 读取已打包纹理（未初始化则抛错）。 */
  getTexture(): any {
    if (!this.texture) throw new Error("Texture atlas not initialized");
    return this.texture;
  }

  /**
   * 查图像在图集中的矩形。
   * @param e - 源图像引用
   */
  getImageRect(e: PackableImage): ImageRect {
    if (!this.imageRects) throw new Error("Texture atlas not initialized");
    const t = this.imageRects.get(e);
    if (!t) throw new Error("Image not found in atlas");
    return t;
  }

  /**
   * 将一组图像装箱到单张 canvas 纹理。
   * @param e - 图像数组
   */
  pack(e: PackableImage[]): void {
    const items: { w: number; h: number; image: PackableImage; fit?: any }[] =
      [];
    e.forEach((img) => {
      items.push({ w: img.width, h: img.height, image: img });
    });
    // 按面积降序：1000*(Δw) + Δh
    items.sort(
      (a, b) => 1000 * (b.w - a.w) + b.h - a.h,
    );
    const packer = new GrowingPacker();
    packer.fit(items);
    const r = packer.root.w;
    const s = packer.root.h;
    const a = document.createElement("canvas");
    const n = a.getContext("2d", { alpha: true })!;
    (a.width = r), (a.height = s);
    const o = new Map<PackableImage, ImageRect>();
    items.forEach((item) => {
      if (!item.fit)
        throw new Error("Couldn't fit all images in a single texture");
      const img = item.image;
      const x = item.fit.x;
      const y = item.fit.y;
      (o.set(img, { x, y, width: item.w, height: item.h }),
        n.drawImage(img, x, y));
    });
    const l = new THREE.Texture(a);
    (l.minFilter = THREE.NearestFilter),
      (l.magFilter = THREE.NearestFilter),
      (l.needsUpdate = true),
      (this.texture = l),
      (this.imageRects = o);
  }
}
