/**
 * TmpDrawable — 将 TmpFile 等高瓦片数据绘到 IndexedBitmap（含 extra 区）。
 *
 * 由 engine/gfx/drawable/TmpDrawable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { IndexedBitmap } from "data/Bitmap"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Tmp 瓦片最小形状。 */
export interface TmpTileLike {
  tileData: ArrayLike<number>;
  width: number;
  height: number;
  x: number;
  y: number;
  hasExtraData?: boolean;
  extraX?: number;
  extraY?: number;
  extraWidth?: number;
  extraHeight?: number;
  extraData?: ArrayLike<number>;
}

/** TmpDrawable：菱形 tile 块 + 可选 extra 矩形区。 */
export class TmpDrawable {
  /**
   * 按菱形扫描线把 tileData 写入 indexed（上半 span 递增、下半递减）。
   * @param width/height 目标块尺寸；ox/oy 为绘制偏移。
   * 值为 0 跳过写入；pos 越界跳过但仍推进游标与源下标 h。
   */
  drawTileBlock(
    tile: TmpTileLike,
    indexed: IndexedBitmap,
    width: number,
    height: number,
    ox: number,
    oy: number,
  ): void {
    const data = indexed.data;
    const halfH = height / 2;
    let pos = width / 2 - 2 + indexed.width * oy + ox;
    const limit = indexed.width * indexed.height;
    let row = 0;
    let span = 0;
    let src = 0;
    for (; row < halfH; row++) {
      span += 4;
      for (let e = 0; e < span; e++) {
        const g = tile.tileData[src];
        if (g !== 0 && pos >= 0 && pos < limit) data[pos] = g;
        pos++;
        src++;
      }
      pos += indexed.width - (span + 2);
    }
    for (pos += 4; row < height; row++) {
      span -= 4;
      for (let e = 0; e < span; e++) {
        const p = tile.tileData[src];
        if (pos >= 0 && pos < limit) data[pos] = p;
        pos += 1;
        src++;
      }
      pos += indexed.width - (span - 2);
    }
  }

  /** 绘制完整瓦片：按 extra 扩大画布后写 tile 块，再叠 extra 区。 */
  draw(tile: TmpTileLike, width: number, height: number): IndexedBitmap {
    let w = width;
    let h = height;
    let ox = 0;
    let oy = 0;
    if (tile.hasExtraData) {
      ox += Math.max(0, tile.x - (tile.extraX as number));
      oy += Math.max(0, tile.y - (tile.extraY as number));
      w += Math.max(0, tile.x - (tile.extraX as number));
      h += Math.max(0, tile.y - (tile.extraY as number));
    }
    const indexed = new IndexedBitmap(w, h);
    this.drawTileBlock(tile, indexed, width, height, ox, oy);
    if (tile.hasExtraData) this.drawExtraData(tile, indexed);
    return indexed;
  }

  /** 将 extraData 矩形写入 indexed（0 跳过）。 */
  drawExtraData(tile: TmpTileLike, indexed: IndexedBitmap): void {
    if (tile.hasExtraData) {
      const data = indexed.data;
      const stride = indexed.width;
      const limit = stride * indexed.height;
      const sx = Math.max(0, (tile.extraX as number) - tile.x);
      let pos = 0 + stride * Math.max(0, (tile.extraY as number) - tile.y) + sx;
      let src = 0;
      for (let y = 0; y < (tile.extraHeight as number); y++) {
        for (let x = 0; x < (tile.extraWidth as number); x++) {
          const v = (tile.extraData as ArrayLike<number>)[src];
          if (v !== 0 && pos >= 0 && pos < limit) data[pos] = v;
          pos += 1;
          src++;
        }
        pos += stride - (tile.extraWidth as number);
      }
    }
  }
}
