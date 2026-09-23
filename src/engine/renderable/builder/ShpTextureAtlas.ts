/**
 * ShpTextureAtlas — SHP 帧 → IndexedBitmap → 通用 TextureAtlas 封装。
 *
 * 由 engine/renderable/builder/ShpTextureAtlas.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as BitmapModule from "data/Bitmap"; // 孪生
import * as TextureAtlasModule from "engine/gfx/TextureAtlas"; // 孪生

const IndexedBitmap = (BitmapModule as any).IndexedBitmap as any;
const TextureAtlas = (TextureAtlasModule as any).TextureAtlas as any;

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  numImages: number;
  getImage(index: number): {
    width: number;
    height: number;
    imageData: any;
  };
}

/**
 * SHP 纹理图集。
 * fromShpFile 将全部帧转为 IndexedBitmap 后 pack，缓存 images 与 atlas。
 */
export class ShpTextureAtlas {
  private images?: any[];
  private atlas?: any;

  /**
   * 从 SHP 文件构建图集。
   * @param e - SHP 文件
   * @returns this（链式）
   */
  fromShpFile(e: ShpFileLike): this {
    const frames: any[] = [];
    for (let s = 0; s < e.numImages; s++) {
      const img = e.getImage(s);
      frames.push(new IndexedBitmap(img.width, img.height, img.imageData));
    }
    const r = new TextureAtlas();
    (r.pack(frames), (this.images = frames), (this.atlas = r));
    return this;
  }

  /**
   * 帧索引 → 图集矩形。
   * @param e - 帧索引
   */
  getTextureArea(e: number): any {
    return this.atlas.getImageRect(this.images![e]);
  }

  /** 读取图集纹理。 */
  getTexture(): any {
    return this.atlas.getTexture();
  }

  /** 释放底层图集资源。 */
  dispose(): void {
    this.atlas.dispose();
  }
}
